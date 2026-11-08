import { Pipe, PipeTransform } from '@angular/core';

export type FormatoFecha = 'corta' | 'hora' | 'completa';

// La API envía las fechas sin zona horaria: se leen del texto, sin usar Date, para evitar desplazamientos
const PATRON_ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

@Pipe({ name: 'fechaHora' })
export class FechaHoraPipe implements PipeTransform {
  transform(valor: string | null | undefined, formato: FormatoFecha = 'completa'): string {
    const partes = valor ? PATRON_ISO.exec(valor) : null;
    if (partes === null) {
      return '—';
    }

    const [, anio, mes, dia, horas, minutos] = partes;
    const fecha = `${dia}/${mes}/${anio}`;
    const hora = horas === undefined ? null : `${horas}:${minutos}`;

    switch (formato) {
      case 'corta':
        return fecha;
      case 'hora':
        return hora ?? '—';
      case 'completa':
        return hora === null ? fecha : `${fecha} ${hora}`;
    }
  }
}
