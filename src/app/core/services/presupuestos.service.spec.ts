import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { LineaCreada, LineaRequest, Presupuesto, Totales } from '@core/models';
import { PresupuestosService } from './presupuestos.service';

const PRESUPUESTO: Presupuesto = {
  id: 1,
  ordenId: 9,
  estado: 'enviado',
  lineas: [],
  subtotal: 100,
  ivaPorcentaje: 21,
  iva: 21,
  total: 121,
  tiempoEstimadoHoras: 2,
  garantiaMeses: 12,
  motivoRechazo: null,
  enviadoEn: '2026-11-09T10:00:00Z',
  respondidoEn: null,
  avisosStock: []
};

const TOTALES: Totales = { subtotal: 100, ivaPorcentaje: 21, iva: 21, total: 121 };

const LINEA: LineaRequest = {
  tipo: 'mano_obra',
  concepto: 'Cambio de pastillas',
  cantidad: 2,
  precioUnitario: 50
};

const LINEA_CREADA: LineaCreada = {
  linea: {
    id: 5,
    tipo: 'mano_obra',
    piezaId: null,
    referencia: null,
    concepto: 'Cambio de pastillas',
    cantidad: 2,
    precioUnitario: 50,
    importe: 100
  },
  totales: TOTALES,
  avisoStock: null
};

describe('PresupuestosService', () => {
  let servicio: PresupuestosService;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(PresupuestosService);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('autorizar hace POST /presupuestos/1/autorizar y emite el presupuesto', () => {
    const autorizado: Presupuesto = { ...PRESUPUESTO, estado: 'autorizado' };
    let emitido: Presupuesto | undefined;

    servicio.autorizar(1).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1/autorizar');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toBeNull();
    peticion.flush(autorizado);

    expect(emitido).toEqual(autorizado);
  });

  it('rechazar envía {motivo}', () => {
    const rechazado: Presupuesto = {
      ...PRESUPUESTO,
      estado: 'rechazado',
      motivoRechazo: 'Demasiado caro'
    };
    let emitido: Presupuesto | undefined;

    servicio.rechazar(1, 'Demasiado caro').subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1/rechazar');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ motivo: 'Demasiado caro' });
    peticion.flush(rechazado);

    expect(emitido).toEqual(rechazado);
  });

  it('rechazar sin motivo no incluye ningún texto en el cuerpo', () => {
    servicio.rechazar(1).subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1/rechazar');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.serializeBody()).toBe('{}');
    peticion.flush(PRESUPUESTO);
  });

  it('obtenerPorOrden y crear usan la ruta anidada en la orden', () => {
    servicio.obtenerPorOrden(9).subscribe();
    servicio.crear(9).subscribe();

    const [obtener, crear] = httpSimulado.match('/api/v1/ordenes/9/presupuesto');

    expect(obtener.request.method).toBe('GET');
    expect(crear.request.method).toBe('POST');
    expect(crear.request.body).toBeNull();

    obtener.flush(PRESUPUESTO);
    crear.flush({ ...PRESUPUESTO, estado: 'borrador' });
  });

  it('actualizar hace PATCH con los datos', () => {
    const datos = { tiempoEstimadoHoras: 3.5, garantiaMeses: 24 };

    servicio.actualizar(1, datos).subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1');
    expect(peticion.request.method).toBe('PATCH');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(PRESUPUESTO);
  });

  it('anadirLinea hace POST con la línea y emite LineaCreada', () => {
    let emitido: LineaCreada | undefined;

    servicio.anadirLinea(1, LINEA).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1/lineas');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(LINEA);
    peticion.flush(LINEA_CREADA);

    expect(emitido).toEqual(LINEA_CREADA);
  });

  it('modificarLinea hace PUT sobre la línea y emite LineaCreada', () => {
    let emitido: LineaCreada | undefined;

    servicio.modificarLinea(1, 5, LINEA).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1/lineas/5');
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual(LINEA);
    peticion.flush(LINEA_CREADA);

    expect(emitido).toEqual(LINEA_CREADA);
  });

  it('eliminarLinea hace DELETE y emite los totales', () => {
    let emitido: Totales | undefined;

    servicio.eliminarLinea(1, 5).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1/lineas/5');
    expect(peticion.request.method).toBe('DELETE');
    peticion.flush(TOTALES);

    expect(emitido).toEqual(TOTALES);
  });

  it('enviar hace POST /presupuestos/1/enviar sin cuerpo', () => {
    servicio.enviar(1).subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/presupuestos/1/enviar');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toBeNull();
    peticion.flush(PRESUPUESTO);
  });
});
