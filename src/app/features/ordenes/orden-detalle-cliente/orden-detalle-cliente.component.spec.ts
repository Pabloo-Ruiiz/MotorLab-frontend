import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import type { EstadoOrden, OrdenDetalle, Seguimiento } from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';

import { OrdenDetalleClienteComponent } from './orden-detalle-cliente.component';

describe('OrdenDetalleClienteComponent', () => {
  let fixture: ComponentFixture<OrdenDetalleClienteComponent>;
  let elemento: HTMLElement;
  let cancelar: ReturnType<typeof vi.fn>;

  const orden = (estado: EstadoOrden) =>
    ({
      id: 2492,
      estado,
      progreso: 65,
      urgencia: 'alta',
      tipoServicio: 'motor',
      sintoma: 'Hace un ruido raro al arrancar',
      cuandoOcurre: 'al_arrancar',
      elevador: null,
      vehiculo: { marca: 'BMW', modelo: 'Serie 1', matricula: '9960KDV' },
      mecanico: null,
      presupuesto: null
    }) as unknown as OrdenDetalle;

  const seguimiento = (listoEstimado: string | null): Seguimiento => ({
    ordenId: 2492,
    vehiculo: 'BMW Serie 1',
    estado: 'arreglando',
    progreso: 65,
    listoEstimado,
    eventos: [
      { estado: 'recibido', descripcion: null, fechaHora: '2026-11-10T09:00:00' },
      { estado: 'arreglando', descripcion: 'Cambio de correa', fechaHora: '2026-11-12T10:30:00' }
    ]
  });

  async function crear(estado: EstadoOrden, listoEstimado: string | null = '2026-11-14T17:00:00') {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
    cancelar = vi.fn().mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '2492' }) } }
        },
        {
          provide: OrdenesService,
          useValue: {
            obtener: () => of(orden(estado)),
            seguimiento: () => of(seguimiento(listoEstimado)),
            cancelar
          }
        }
      ]
    });

    fixture = TestBed.createComponent(OrdenDetalleClienteComponent);
    elemento = fixture.nativeElement as HTMLElement;
    await vi.waitFor(() => expect(elemento.querySelector('.resumen')).not.toBeNull());
  }

  const texto = (selector: string) => elemento.querySelector(selector)?.textContent ?? '';

  it('muestra el número, el estado, el progreso y el vehículo reales', async () => {
    await crear('arreglando');

    expect(texto('.resumen__numero')).toBe('#2492');
    expect(texto('.resumen .estado-orden')).toContain('Arreglando');
    expect(texto('.estimado__porcentaje')).toBe('65%');
    expect(texto('.estimado__fecha')).toContain('14/11/2026 17:00');
    expect(elemento.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('65');
    expect(texto('.vehiculo__nombre')).toContain('BMW Serie 1');
    expect(elemento.querySelector('.resumen__numero')?.closest('.detalle')).not.toBeNull();
  });

  it('no inventa una fecha si no hay estimación', async () => {
    await crear('arreglando', null);

    expect(texto('.estimado__fecha')).toContain('Por confirmar');
  });

  it('marca la fase actual, muestra sus datos reales y deja discretas las pendientes', async () => {
    await crear('arreglando');
    const pasos = [...elemento.querySelectorAll('.paso')];

    expect(pasos).toHaveLength(5);
    expect(pasos[3].getAttribute('aria-current')).toBe('step');
    expect(pasos[3].textContent).toContain('Cambio de correa');
    expect(pasos[3].querySelector('time')?.textContent).toContain('12/11/2026 10:30');
    expect(pasos[0].classList).toContain('paso--hecho');
    expect(pasos[4].classList).not.toContain('paso--hecho');
    expect(pasos[4].querySelector('time')).toBeNull();
  });

  it('destaca la urgencia con su tono', async () => {
    await crear('arreglando');

    expect(elemento.querySelector('.datos .estado-orden')?.getAttribute('data-tono')).toBe('error');
  });

  it('no ofrece cancelar una vez que la reparación ha empezado', async () => {
    await crear('arreglando');

    expect(elemento.querySelector('.cancelar')).toBeNull();
  });

  it('pide confirmación antes de cancelar', async () => {
    await crear('solicitud_recibida');

    (elemento.querySelector('.cancelar') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(cancelar).not.toHaveBeenCalled();

    const confirmar = [...elemento.querySelectorAll<HTMLButtonElement>('dialog button')].find(
      (boton) => boton.textContent?.trim() === 'Cancelar orden'
    );
    confirmar?.click();

    expect(cancelar).toHaveBeenCalledWith(2492);
  });
});
