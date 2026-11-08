import { Pipe, PipeTransform } from '@angular/core';

const FORMATO_EUROS = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

@Pipe({ name: 'euros' })
export class EurosPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor === null || valor === undefined ? '—' : FORMATO_EUROS.format(valor);
  }
}
