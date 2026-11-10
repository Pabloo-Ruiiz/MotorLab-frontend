import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import type { OrdenResumen } from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';

import { OrdenesListaClienteComponent } from './ordenes-lista-cliente.component';

describe('OrdenesListaClienteComponent', () => {
  const orden = (cambios: Partial<OrdenResumen>) =>
    ({
      ordenId: 2492,
      estado: 'arreglando',
      progreso: 45,
      urgencia: 'media',
      tipoServicio: 'motor',
      matricula: '4821KLB',
      marca: 'BMW',
      modelo: 'Serie 1',
      fechaEstimada: null,
      presupuestoEstado: null,
      presupuestoTotal: null,
      ...cambios
    }) as OrdenResumen;

  async function crear(datos: OrdenResumen[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: OrdenesService, useValue: { listar: () => of({ datos }) } }
      ]
    });

    const fixture = TestBed.createComponent(OrdenesListaClienteComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('muestra los datos de la orden y enlaza a su detalle', async () => {
    const { elemento } = await crear([orden({})]);
    const tarjeta = elemento.querySelector('.orden') as HTMLElement;

    expect(tarjeta.querySelector('.orden__numero')?.textContent).toBe('#2492');
    expect(tarjeta.querySelector('.orden__vehiculo')?.textContent).toBe('BMW Serie 1');
    expect(tarjeta.querySelector('.placa')?.textContent).toContain('4821 KLB');
    expect(tarjeta.querySelector('.orden__servicio')?.textContent).toContain('Motor');
    expect(tarjeta.querySelector('.progreso__valor')?.textContent).toBe('45%');
    expect(tarjeta.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('45');
    expect(tarjeta.querySelector('.orden__enlace')?.getAttribute('href')).toBe(
      '/cliente/ordenes/2492'
    );
    expect(tarjeta.getAttribute('data-tono')).toBe('exito');
  });

  it('las pestañas separan las órdenes activas del historial', async () => {
    const { fixture, elemento } = await crear([
      orden({ ordenId: 1 }),
      orden({ ordenId: 2, estado: 'entregado' })
    ]);
    const numeros = () =>
      [...elemento.querySelectorAll('.orden__numero')].map((numero) => numero.textContent);
    const historial = [...elemento.querySelectorAll<HTMLButtonElement>('.pestana')].find(
      (boton) => boton.textContent?.trim() === 'Historial'
    );

    expect(numeros()).toEqual(['#1']);

    historial?.click();
    await fixture.whenStable();

    expect(numeros()).toEqual(['#2']);
    expect(historial?.getAttribute('aria-pressed')).toBe('true');
  });

  it('con un presupuesto enviado lo destaca y permite verlo', async () => {
    const { elemento } = await crear([
      orden({ presupuestoEstado: 'enviado', presupuestoTotal: 120 })
    ]);

    expect(elemento.querySelector('.estado-orden')?.textContent).toBe('Presupuesto listo');
    expect(elemento.querySelector('.orden__ver')?.getAttribute('href')).toBe(
      '/cliente/ordenes/2492/presupuesto'
    );
  });

  it('mantiene el enlace para crear una nueva solicitud', async () => {
    const { elemento } = await crear([]);

    expect(elemento.querySelector('.nueva')?.getAttribute('href')).toBe('/cliente/solicitud/nueva');
  });
});
