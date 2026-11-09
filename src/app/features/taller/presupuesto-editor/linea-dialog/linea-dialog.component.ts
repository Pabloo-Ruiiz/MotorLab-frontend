import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';

import type { Linea, LineaRequest, Pieza, TipoLinea } from '@core/models';
import { PiezasService } from '@core/services/piezas.service';
import { aApiError } from '@core/util/api-error';
import {
  aplicarErroresServidor,
  campoConError,
  limpiarErroresServidor
} from '@core/util/formularios';
import { mayorQueCeroValidator } from '@core/util/validadores';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { EurosPipe } from '@shared/pipes/euros.pipe';

const DEBOUNCE_MS = 300;
const LIMITE_RESULTADOS = 10;
const MAX_BUSQUEDA = 120;
const MAX_CONCEPTO = 150;

type EstadoBusqueda = 'inactiva' | 'buscando' | 'lista' | 'error';

// Al editar puede no conocerse el stock: la línea no lo trae y la pieza quizá ya no esté activa
type PiezaElegida = Pick<Pieza, 'id' | 'referencia' | 'nombre' | 'precio'> & {
  stock: number | null;
};

@Component({
  selector: 'app-linea-dialog',
  imports: [ErroresCampoComponent, EurosPipe, ReactiveFormsModule],
  templateUrl: './linea-dialog.component.html',
  styleUrl: './linea-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineaDialogComponent {
  private readonly piezas = inject(PiezasService);
  private readonly cambios = inject(ChangeDetectorRef);

  readonly abierto = input(false, { transform: booleanAttribute });
  readonly linea = input<Linea | null>(null);
  readonly tipoInicial = input<TipoLinea>('pieza');
  readonly guardando = input(false, { transform: booleanAttribute });

  readonly guardar = output<LineaRequest>();
  readonly cancelar = output<void>();

  protected readonly campoConError = campoConError;
  protected readonly maxBusqueda = MAX_BUSQUEDA;
  protected readonly maxConcepto = MAX_CONCEPTO;
  protected readonly mensajesPieza = { required: 'Elige una pieza del catálogo' };
  protected readonly mensajesCantidad = {
    min: 'Debe ser mayor que cero',
    pattern: 'Debe ser un número entero'
  };
  protected readonly mensajesConcepto = { pattern: 'Este campo es obligatorio' };
  protected readonly mensajesPrecio = { min: 'No puede ser negativo' };
  protected readonly tipos: readonly { valor: TipoLinea; texto: string }[] = [
    { valor: 'pieza', texto: 'Pieza' },
    { valor: 'mano_obra', texto: 'Mano de obra' }
  ];

  protected readonly form = inject(NonNullableFormBuilder).group({
    tipo: 'pieza' as TipoLinea,
    piezaId: null as number | null,
    concepto: '',
    cantidad: null as number | null,
    precioUnitario: null as number | null
  });
  protected readonly busqueda = new FormControl('', { nonNullable: true });

  protected readonly tipo = toSignal(this.form.controls.tipo.valueChanges, {
    initialValue: 'pieza' as TipoLinea
  });
  private readonly cantidad = toSignal(this.form.controls.cantidad.valueChanges, {
    initialValue: null
  });

  protected readonly resultados = signal<Pieza[]>([]);
  protected readonly estadoBusqueda = signal<EstadoBusqueda>('inactiva');
  protected readonly piezaElegida = signal<PiezaElegida | null>(null);
  protected readonly errorGeneral = signal<string | null>(null);

  protected readonly avisoStock = computed(() => {
    const stock = this.piezaElegida()?.stock ?? null;
    const necesarias = this.cantidad();

    return this.tipo() === 'pieza' && stock !== null && necesarias !== null && stock < necesarias
      ? `Stock ${stock}, necesarias ${necesarias}`
      : null;
  });

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // Solo depende de «abierto»: el formulario se prepara cada vez que se abre el diálogo
    effect(() => {
      if (this.abierto()) {
        untracked(() => this.preparar());
      }
    });

    // showModal mueve el foco al diálogo y close lo devuelve al elemento que lo tenía antes
    afterRenderEffect(() => {
      const dialogo = this.dialogo().nativeElement;

      if (this.abierto() && !dialogo.open) {
        dialogo.showModal();
      } else if (!this.abierto() && dialogo.open) {
        dialogo.close();
      }
    });

    this.busqueda.valueChanges
      .pipe(
        debounceTime(DEBOUNCE_MS),
        map((q) => q.trim()),
        tap((q) => this.estadoBusqueda.set(q === '' ? 'inactiva' : 'buscando')),
        switchMap((q) => (q === '' ? of([]) : this.buscar(q))),
        takeUntilDestroyed()
      )
      .subscribe((resultados) => {
        this.resultados.set(resultados);
        if (this.estadoBusqueda() === 'buscando') {
          this.estadoBusqueda.set('lista');
        }
      });
  }

  // Lo llama la pantalla que hace la petición, con el error que le devuelva el servidor
  mostrarErrorServidor(error: unknown): void {
    const apiError = aApiError(error);
    const resto = aplicarErroresServidor(this.form, apiError);

    // También los 5xx y los fallos de conexión: el toast del interceptor queda tapado por el modal
    if (resto.length > 0 || apiError.detalles.length === 0) {
      this.errorGeneral.set([apiError.mensaje, ...resto.map((d) => d.mensaje)].join(' · '));
    }

    // La llamada llega desde fuera de la plantilla: sin esto, OnPush no pintaría las clases de error
    this.cambios.markForCheck();
  }

  protected cambiarTipo(tipo: TipoLinea): void {
    if (tipo !== this.form.controls.tipo.value) {
      this.form.controls.tipo.setValue(tipo);
      this.aplicarValidadores(tipo);
      this.errorGeneral.set(null);
    }
  }

  protected elegir(pieza: Pieza): void {
    this.form.controls.piezaId.setValue(pieza.id);
    this.piezaElegida.set(pieza);
    this.resultados.set([]);
    this.estadoBusqueda.set('inactiva');
    this.busqueda.setValue('');
  }

  protected enviar(): void {
    if (this.guardando()) {
      return;
    }

    limpiarErroresServidor(this.form);
    this.errorGeneral.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardar.emit(this.peticion());
  }

  // Si sigue abierto para el componente padre, el cierre viene del navegador (tecla Escape)
  protected alCerrar(): void {
    if (this.abierto()) {
      this.cancelar.emit();
    }
  }

  private peticion(): LineaRequest {
    const { tipo, piezaId, concepto, cantidad, precioUnitario } = this.form.getRawValue();

    return tipo === 'pieza'
      ? { tipo, piezaId: piezaId as number, cantidad: cantidad as number }
      : {
          tipo,
          concepto: concepto.trim(),
          cantidad: cantidad as number,
          precioUnitario: precioUnitario as number
        };
  }

  private preparar(): void {
    const linea = this.linea();
    const tipo = linea?.tipo ?? this.tipoInicial();
    const esManoObra = tipo === 'mano_obra';

    this.errorGeneral.set(null);
    this.resultados.set([]);
    this.estadoBusqueda.set('inactiva');
    this.piezaElegida.set(null);
    this.busqueda.reset();
    this.form.reset({
      tipo,
      piezaId: linea?.piezaId ?? null,
      concepto: esManoObra ? (linea?.concepto ?? '') : '',
      cantidad: linea?.cantidad ?? null,
      precioUnitario: esManoObra ? (linea?.precioUnitario ?? null) : null
    });
    this.aplicarValidadores(tipo);

    if (linea !== null && linea.piezaId !== null) {
      this.cargarPiezaDeLinea(linea, linea.piezaId);
    }
  }

  private aplicarValidadores(tipo: TipoLinea): void {
    const { piezaId, concepto, cantidad, precioUnitario } = this.form.controls;
    const esPieza = tipo === 'pieza';

    piezaId.setValidators(esPieza ? [Validators.required] : null);
    concepto.setValidators(
      esPieza
        ? null
        : [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_CONCEPTO)]
    );
    cantidad.setValidators(
      esPieza
        ? [Validators.required, mayorQueCeroValidator, Validators.pattern(/^-?[0-9]+$/)]
        : [Validators.required, mayorQueCeroValidator]
    );
    precioUnitario.setValidators(esPieza ? null : [Validators.required, Validators.min(0)]);

    for (const control of [piezaId, concepto, cantidad, precioUnitario]) {
      control.updateValueAndValidity();
    }
  }

  // La línea no trae el stock: se busca la pieza por su referencia para poder avisar también al editar
  private cargarPiezaDeLinea(linea: Linea, piezaId: number): void {
    const referencia = linea.referencia ?? '';
    this.piezaElegida.set({
      id: piezaId,
      referencia,
      nombre: linea.concepto,
      precio: linea.precioUnitario,
      stock: null
    });

    if (referencia !== '') {
      this.buscar(referencia).subscribe((resultados) => {
        const pieza = resultados.find(({ id }) => id === piezaId);
        if (pieza !== undefined && this.piezaElegida()?.id === piezaId) {
          this.piezaElegida.set(pieza);
        }
      });
    }
  }

  private buscar(q: string) {
    return this.piezas.listar({ q, soloActivas: true, limite: LIMITE_RESULTADOS }).pipe(
      map(({ datos }) => datos),
      catchError(() => {
        this.estadoBusqueda.set('error');
        return of<Pieza[]>([]);
      })
    );
  }
}
