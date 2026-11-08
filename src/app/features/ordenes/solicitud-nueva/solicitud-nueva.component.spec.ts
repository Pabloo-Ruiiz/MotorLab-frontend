import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import type { OrdenCreateResponse, Pagina, Vehiculo } from '@core/models';
import { OrdenesService } from '@core/services/ordenes.service';
import { VehiculosService } from '@core/services/vehiculos.service';
import { fechaLocalDeHoy } from '@core/util/validadores';
import { SolicitudNuevaComponent } from './solicitud-nueva.component';

describe('SolicitudNuevaComponent', () => {
  const SINTOMA_VALIDO = 'Hace un ruido raro al frenar';

  const vehiculo: Vehiculo = {
    id: 7,
    usuarioId: 3,
    matricula: '4821KLB',
    marca: 'Seat',
    modelo: 'León',
    version: '1.5 TSI',
    anio: 2019,
    kilometros: 86400,
    activo: true
  };
  const paginaVehiculos: Pagina<Vehiculo> = {
    datos: [vehiculo],
    pagina: 1,
    limite: 100,
    total: 1,
    totalPaginas: 1
  };
  const respuesta: OrdenCreateResponse = {
    id: 2481,
    estado: 'solicitud_recibida',
    urgencia: 'alta',
    mensaje: 'Solicitud registrada'
  };

  let ordenesSimulado: { crear: ReturnType<typeof vi.fn> };
  let fixture: ComponentFixture<SolicitudNuevaComponent>;
  let elemento: HTMLElement;

  function indicador(): string | undefined {
    return elemento.querySelector('.progreso__actual')?.textContent?.trim();
  }

  function errorDe(selector: string): string | undefined {
    return elemento.querySelector(selector)?.closest('.campo')?.querySelector('.campo__error')
      ?.textContent as string | undefined;
  }

  function escribir(selector: string, valor: string): void {
    const campo = elemento.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  async function pulsar(texto: string): Promise<void> {
    const boton = [...elemento.querySelectorAll('button')].find(
      (candidato) => candidato.textContent?.trim() === texto
    );
    if (boton === undefined) {
      throw new Error(`No existe el botón «${texto}»`);
    }
    boton.click();
    await fixture.whenStable();
  }

  async function avanzar(): Promise<void> {
    elemento
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
  }

  async function completarPaso1(): Promise<void> {
    const selector = elemento.querySelector('#solicitud-vehiculo') as HTMLSelectElement;
    selector.selectedIndex = 1;
    selector.dispatchEvent(new Event('change'));
    await avanzar();
  }

  async function rellenarPaso2(sintoma: string): Promise<void> {
    await pulsar('Frenos');
    escribir('#solicitud-sintoma', sintoma);
    await pulsar('Sí');
    await pulsar('Media');
  }

  async function rellenarPaso3SinPrivacidad(fecha: string): Promise<void> {
    escribir('#solicitud-fecha', fecha);
    await pulsar('Mañana');
    await pulsar('Teléfono');
  }

  async function aceptarPrivacidad(): Promise<void> {
    (elemento.querySelector('input[type="checkbox"]') as HTMLInputElement).click();
    await fixture.whenStable();
  }

  async function llegarAlPaso3(): Promise<void> {
    await completarPaso1();
    await rellenarPaso2(SINTOMA_VALIDO);
    await avanzar();
  }

  beforeEach(async () => {
    ordenesSimulado = { crear: vi.fn().mockReturnValue(of(respuesta)) };

    TestBed.configureTestingModule({
      imports: [SolicitudNuevaComponent],
      providers: [
        provideRouter([]),
        { provide: OrdenesService, useValue: ordenesSimulado },
        { provide: VehiculosService, useValue: { listar: () => of(paginaVehiculos) } }
      ]
    });

    fixture = TestBed.createComponent(SolicitudNuevaComponent);
    elemento = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('no se puede avanzar del paso 2 con un síntoma de 10 caracteres', async () => {
    await completarPaso1();
    await rellenarPaso2('1234567890');

    await avanzar();

    expect(indicador()).toBe('Paso 2 de 3 · Problema');
    expect(errorDe('#solicitud-sintoma')).toBe('Debe tener al menos 20 caracteres');
  });

  it('una fecha pasada es inválida en el paso 3', async () => {
    await llegarAlPaso3();
    await rellenarPaso3SinPrivacidad('2020-01-01');
    await aceptarPrivacidad();

    await avanzar();

    expect(indicador()).toBe('Paso 3 de 3 · Cita');
    expect(errorDe('#solicitud-fecha')).toBe('La fecha debe ser hoy o posterior');
  });

  it('sin aceptaPrivacidad no se envía', async () => {
    await llegarAlPaso3();
    await rellenarPaso3SinPrivacidad(fechaLocalDeHoy());

    await avanzar();

    expect(indicador()).toBe('Paso 3 de 3 · Cita');
    expect(errorDe('input[type="checkbox"]')).toBe('Este campo es obligatorio');
    expect(ordenesSimulado.crear).not.toHaveBeenCalled();
  });

  it('con datos válidos llama a OrdenesService.crear con el cuerpo esperado', async () => {
    await llegarAlPaso3();
    await rellenarPaso3SinPrivacidad(fechaLocalDeHoy());
    await aceptarPrivacidad();
    await avanzar();

    expect(indicador()).toBe('Resumen');
    expect(ordenesSimulado.crear).not.toHaveBeenCalled();

    await avanzar();

    expect(ordenesSimulado.crear).toHaveBeenCalledTimes(1);
    expect(ordenesSimulado.crear).toHaveBeenCalledWith({
      vehiculoId: 7,
      tipoServicio: 'frenos',
      sintoma: SINTOMA_VALIDO,
      cuandoOcurre: null,
      conduccionSegura: 'si',
      urgencia: 'media',
      fechaPreferida: fechaLocalDeHoy(),
      franjaPreferida: 'manana',
      contactoPreferido: 'telefono',
      aceptaPrivacidad: true
    });
  });
});
