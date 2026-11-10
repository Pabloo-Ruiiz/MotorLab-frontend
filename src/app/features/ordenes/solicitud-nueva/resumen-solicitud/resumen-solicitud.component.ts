import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface GrupoResumen {
  titulo: string;
  filas: { etiqueta: string; valor: string }[];
}

// Datos de la solicitud antes de enviarla, agrupados por el paso en el que se rellenan
@Component({
  selector: 'app-resumen-solicitud',
  template: `
    <div class="resumen">
      @for (grupo of grupos(); track grupo.titulo) {
        <section class="resumen__grupo" [attr.aria-label]="grupo.titulo">
          <h3 class="resumen__titulo">{{ grupo.titulo }}</h3>
          <dl class="resumen__filas">
            @for (fila of grupo.filas; track fila.etiqueta) {
              <div class="resumen__fila">
                <dt>{{ fila.etiqueta }}</dt>
                <dd>{{ fila.valor }}</dd>
              </div>
            }
          </dl>
        </section>
      }
    </div>
  `,
  styleUrl: './resumen-solicitud.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenSolicitudComponent {
  readonly grupos = input.required<readonly GrupoResumen[]>();
}
