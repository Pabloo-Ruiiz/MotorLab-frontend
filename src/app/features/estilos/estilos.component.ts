import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_PRESUPUESTO,
  ETIQUETAS_URGENCIA,
  type EstadoOrden,
  type EstadoPresupuesto,
  type Urgencia
} from '@core/models';
import { ToastService } from '@core/services/toast.service';
import { BarraProgresoComponent } from '@shared/components/barra-progreso/barra-progreso.component';
import { CargandoComponent } from '@shared/components/cargando/cargando.component';
import { ErroresCampoComponent } from '@shared/components/errores-campo/errores-campo.component';
import { ModalConfirmacionComponent } from '@shared/components/modal-confirmacion/modal-confirmacion.component';
import { PaginadorComponent } from '@shared/components/paginador/paginador.component';
import { PillEstadoComponent } from '@shared/components/pill-estado/pill-estado.component';
import { PillUrgenciaComponent } from '@shared/components/pill-urgencia/pill-urgencia.component';
import { VacioComponent } from '@shared/components/vacio/vacio.component';

// TODO: esta página solo existe en desarrollo y se elimina en el paso de errores globales (F26).
@Component({
  selector: 'app-estilos',
  imports: [
    BarraProgresoComponent,
    CargandoComponent,
    ErroresCampoComponent,
    ModalConfirmacionComponent,
    PaginadorComponent,
    PillEstadoComponent,
    PillUrgenciaComponent,
    ReactiveFormsModule,
    VacioComponent
  ],
  templateUrl: './estilos.component.html',
  styleUrl: './estilos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstilosComponent {
  protected readonly colores = [
    { nombre: '--mo-naranja', valor: '#E8651A' },
    { nombre: '--mo-naranja-claro', valor: '#FDEBDD' },
    { nombre: '--mo-naranja-oscuro', valor: '#B34709' },
    { nombre: '--mo-noche', valor: '#1B1C2B' },
    { nombre: '--mo-fondo', valor: '#F4F5F7' },
    { nombre: '--mo-texto', valor: '#15151C' },
    { nombre: '--mo-blanco', valor: '#FFFFFF' },
    { nombre: '--mo-gris', valor: '#7C808C' },
    { nombre: '--mo-gris-oscuro', valor: '#5C606B' },
    { nombre: '--mo-linea', valor: '#E4E6EB' },
    { nombre: '--mo-verde', valor: '#1FA463' },
    { nombre: '--mo-verde-claro', valor: '#E3F5EB' },
    { nombre: '--mo-verde-oscuro', valor: '#14703F' },
    { nombre: '--mo-rojo', valor: '#E5383B' },
    { nombre: '--mo-rojo-claro', valor: '#FDE8E8' },
    { nombre: '--mo-rojo-oscuro', valor: '#B42326' },
    { nombre: '--mo-ambar', valor: '#8A5E06' },
    { nombre: '--mo-ambar-claro', valor: '#FFF1D0' },
    { nombre: '--mo-azul', valor: '#2F6FDE' },
    { nombre: '--mo-azul-claro', valor: '#E5EEFD' },
    { nombre: '--mo-azul-oscuro', valor: '#1F55B8' }
  ];

  protected readonly botones = [
    { clase: 'btn--primario', etiqueta: 'Primario' },
    { clase: 'btn--secundario', etiqueta: 'Secundario' },
    { clase: 'btn--peligro', etiqueta: 'Peligro' },
    { clase: 'btn--fantasma', etiqueta: 'Fantasma' }
  ];

  protected readonly pills = [
    { clase: 'pill--naranja', etiqueta: 'Solicitud recibida' },
    { clase: 'pill--verde', etiqueta: 'Arreglando' },
    { clase: 'pill--rojo', etiqueta: 'Alta' },
    { clase: 'pill--ambar', etiqueta: 'Media' },
    { clase: 'pill--azul', etiqueta: 'En preparación' },
    { clase: 'pill--gris', etiqueta: 'Entregado' }
  ];

  protected readonly opcionesSegmentado = ['Sí', 'No', 'No lo sé'];
  protected readonly opcionesChips = ['Frenos', 'Motor', 'Aceite y filtros', 'Neumáticos', 'ITV'];

  protected readonly segmentoActivo = signal('Sí');
  protected readonly chipActivo = signal('Frenos');

  protected readonly estados = Object.keys(ETIQUETAS_ESTADO) as EstadoOrden[];
  protected readonly estadosPresupuesto = Object.keys(
    ETIQUETAS_ESTADO_PRESUPUESTO
  ) as EstadoPresupuesto[];
  protected readonly urgencias = Object.keys(ETIQUETAS_URGENCIA) as Urgencia[];

  protected readonly paginaEjemplo = signal(1);

  private readonly toast = inject(ToastService);

  protected readonly modalAbierto = signal<'normal' | 'peligro' | null>(null);

  protected readonly controlEjemplo = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.email
  ]);

  protected confirmarModal(): void {
    this.modalAbierto.set(null);
    this.toast.exito('Acción confirmada');
  }

  protected simularErrorServidor(): void {
    this.controlEjemplo.setErrors({ servidor: 'Este correo ya está registrado' });
    this.controlEjemplo.markAsTouched();
  }
}
