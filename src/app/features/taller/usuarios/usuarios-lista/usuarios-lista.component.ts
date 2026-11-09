import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, finalize, map, merge, Observable, of, Subject, switchMap, tap } from 'rxjs';

import {
  ETIQUETAS_ROL,
  type Pagina,
  type Rol,
  type Usuario,
  type UsuarioCreateRequest
} from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { UsuariosService } from '@core/services/usuarios.service';
import { aApiError, mensajeDeError } from '@core/util/api-error';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog.component';

const LIMITE = 20;

const CLASES_ROL: Record<Rol, string> = {
  cliente: 'pill--gris',
  mecanico: 'pill--azul',
  admin: 'pill--naranja'
};

interface FiltrosUrl {
  rol: Rol | '';
  pagina: number;
}

// La URL se puede editar a mano: un valor que el servidor rechazaría se trata como si no estuviera
function leerFiltros(params: ParamMap): FiltrosUrl {
  const rol = params.get('rol');
  const pagina = Number(params.get('pagina'));

  return {
    rol: rol !== null && Object.hasOwn(ETIQUETAS_ROL, rol) ? (rol as Rol) : '',
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1
  };
}

@Component({
  selector: 'app-usuarios-lista',
  imports: [
    CargandoComponent,
    PaginadorComponent,
    ReactiveFormsModule,
    UsuarioDialogComponent,
    VacioComponent
  ],
  templateUrl: './usuarios-lista.component.html',
  styleUrl: './usuarios-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosListaComponent {
  private readonly usuarios = inject(UsuariosService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly usuarioActual = inject(AuthService).usuario;

  private readonly recargas = new Subject<void>();
  private readonly dialogo = viewChild.required(UsuarioDialogComponent);

  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly clasesRol = CLASES_ROL;
  protected readonly opcionesRol = Object.entries(ETIQUETAS_ROL).map(([valor, texto]) => ({
    valor,
    texto
  }));

  protected readonly filtroRol = new FormControl<Rol | ''>('', { nonNullable: true });

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly resultado = signal<Pagina<Usuario> | null>(null);
  protected readonly actualizando = signal<number[]>([]);
  protected readonly dialogoAbierto = signal(false);
  protected readonly guardando = signal(false);
  private readonly filtros = signal<FiltrosUrl>(leerFiltros(this.ruta.snapshot.queryParamMap));

  protected readonly tituloVacio = computed(() =>
    this.filtros().rol ? 'No hay usuarios con este rol' : 'Todavía no hay usuarios'
  );

  constructor() {
    // Una recarga tras crear un usuario no pasa por prepararCarga: la tabla sigue en pantalla
    merge(
      this.ruta.queryParamMap.pipe(
        map(leerFiltros),
        tap((filtros) => this.prepararCarga(filtros))
      ),
      this.recargas.pipe(map(() => this.filtros()))
    )
      .pipe(
        switchMap((filtros) => this.pedirUsuarios(filtros)),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => this.mostrar(resultado));

    this.filtroRol.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((rol) => this.navegar({ rol, pagina: 1 }));
  }

  protected esPropio(usuario: Usuario): boolean {
    return usuario.id === this.usuarioActual()?.id;
  }

  protected cambiarPagina(pagina: number): void {
    this.navegar({ ...this.filtros(), pagina });
  }

  protected reintentar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.recargas.next();
  }

  protected cambiarActivo(usuario: Usuario, casilla: HTMLInputElement): void {
    const { id } = usuario;

    this.actualizando.update((ids) => [...ids, id]);
    this.usuarios
      .actualizar(id, { activo: casilla.checked })
      .pipe(finalize(() => this.actualizando.update((ids) => ids.filter((otro) => otro !== id))))
      .subscribe({
        next: (actualizado) => this.sustituirFila(actualizado),
        error: (error: unknown) => {
          // El navegador ya ha movido el interruptor y [checked] no cambia: hay que devolverlo
          casilla.checked = usuario.activo;
          this.avisarError(error);
        }
      });
  }

  protected guardar(datos: UsuarioCreateRequest): void {
    this.guardando.set(true);
    this.usuarios
      .crear(datos)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.dialogoAbierto.set(false);
          this.toast.exito('Usuario creado');
          this.recargas.next();
        },
        error: (error: unknown) => this.dialogo().mostrarErrorServidor(error)
      });
  }

  private sustituirFila(actualizado: Usuario): void {
    this.resultado.update(
      (actual) =>
        actual && {
          ...actual,
          datos: actual.datos.map((fila) => (fila.id === actualizado.id ? actualizado : fila))
        }
    );
  }

  private avisarError(error: unknown): void {
    const apiError = aApiError(error);

    // El interceptor ya avisa de los fallos de conexión y de los errores 5xx
    if (apiError.status >= 400 && apiError.status < 500) {
      this.toast.error(
        [apiError.mensaje, ...apiError.detalles.map(({ mensaje }) => mensaje)].join(' · ')
      );
    }
  }

  // replaceUrl evita que cada filtro añada una entrada más al historial del navegador
  private navegar({ rol, pagina }: FiltrosUrl): void {
    void this.router.navigate([], {
      relativeTo: this.ruta,
      replaceUrl: true,
      queryParams: { rol: rol || null, pagina: pagina > 1 ? pagina : null }
    });
  }

  private prepararCarga(filtros: FiltrosUrl): void {
    this.filtros.set(filtros);
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.filtroRol.setValue(filtros.rol, { emitEvent: false });
  }

  private pedirUsuarios({ rol, pagina }: FiltrosUrl): Observable<Pagina<Usuario> | null> {
    return this.usuarios.listar({ rol: rol || null, pagina, limite: LIMITE }).pipe(
      catchError((error: unknown) => {
        this.errorCarga.set(mensajeDeError(error));
        return of(null);
      })
    );
  }

  private mostrar(resultado: Pagina<Usuario> | null): void {
    // Un enlace antiguo puede apuntar a una página que ya no existe
    const pagina = this.filtros().pagina;
    if (resultado !== null && resultado.datos.length === 0 && pagina > 1) {
      this.cambiarPagina(Math.max(1, Math.min(resultado.totalPaginas, pagina - 1)));
      return;
    }

    this.cargando.set(false);
    if (resultado !== null) {
      this.resultado.set(resultado);
    }
  }
}
