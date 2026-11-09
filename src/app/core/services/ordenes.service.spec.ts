import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type {
  AsignacionRequest,
  CambioEstadoRequest,
  OrdenCreateRequest,
  OrdenCreateResponse,
  OrdenDetalle
} from '@core/models';
import { OrdenesService } from './ordenes.service';

describe('OrdenesService', () => {
  let servicio: OrdenesService;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(OrdenesService);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('crear hace el POST con el cuerpo correcto y emite la respuesta', () => {
    const datos: OrdenCreateRequest = {
      vehiculoId: 7,
      tipoServicio: 'frenos',
      sintoma: 'Hace un ruido raro al frenar',
      cuandoOcurre: 'al_frenar',
      conduccionSegura: 'si',
      urgencia: 'alta',
      fechaPreferida: '2026-11-20',
      franjaPreferida: 'manana',
      contactoPreferido: 'telefono',
      aceptaPrivacidad: true
    };
    const respuesta: OrdenCreateResponse = {
      id: 2481,
      estado: 'solicitud_recibida',
      urgencia: 'alta',
      mensaje: 'Solicitud registrada'
    };
    let emitido: OrdenCreateResponse | undefined;

    servicio.crear(datos).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/ordenes');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(respuesta, { status: 201, statusText: 'Created' });

    expect(emitido).toEqual(respuesta);
  });

  it('listar omite los parámetros vacíos', () => {
    servicio
      .listar({
        estado: 'arreglando',
        urgencia: null,
        mecanicoId: undefined,
        q: '   ',
        pagina: 2,
        limite: 20
      })
      .subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/ordenes?estado=arreglando&pagina=2&limite=20');
    expect(peticion.request.method).toBe('GET');
    peticion.flush({ datos: [], pagina: 2, limite: 20, total: 0, totalPaginas: 0 });
  });

  it('listar sin filtros no añade parámetros a la URL', () => {
    servicio.listar({ q: '' }).subscribe();

    httpSimulado
      .expectOne('/api/v1/ordenes')
      .flush({ datos: [], pagina: 1, limite: 20, total: 0, totalPaginas: 0 });
  });

  it('listar envía los filtros con valor, incluido el texto de búsqueda', () => {
    servicio.listar({ urgencia: 'alta', mecanicoId: 4, q: '4821' }).subscribe();

    httpSimulado
      .expectOne('/api/v1/ordenes?urgencia=alta&mecanicoId=4&q=4821')
      .flush({ datos: [], pagina: 1, limite: 20, total: 0, totalPaginas: 0 });
  });

  it('obtener, seguimiento y cancelar usan su ruta y su método', () => {
    servicio.obtener(9).subscribe();
    servicio.seguimiento(9).subscribe();
    servicio.cancelar(9).subscribe();

    const obtener = httpSimulado.expectOne('/api/v1/ordenes/9');
    const seguimiento = httpSimulado.expectOne('/api/v1/ordenes/9/seguimiento');
    const cancelar = httpSimulado.expectOne('/api/v1/ordenes/9/cancelar');

    expect(obtener.request.method).toBe('GET');
    expect(seguimiento.request.method).toBe('GET');
    expect(cancelar.request.method).toBe('POST');
    expect(cancelar.request.body).toBeNull();

    obtener.flush({});
    seguimiento.flush({});
    cancelar.flush({});
  });

  it('asignar hace PATCH /ordenes/9/asignacion con los datos y emite la orden', () => {
    const datos: AsignacionRequest = {
      mecanicoId: 4,
      elevador: 'Elevador 2',
      fechaEstimada: '2026-11-20T09:00:00'
    };
    const respuesta = { id: 9, estado: 'recibido' } as OrdenDetalle;
    let emitido: OrdenDetalle | undefined;

    servicio.asignar(9, datos).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/ordenes/9/asignacion');
    expect(peticion.request.method).toBe('PATCH');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(respuesta);

    expect(emitido).toEqual(respuesta);
  });

  it('cambiarEstado hace PATCH /ordenes/9/estado con los datos y emite la orden', () => {
    const datos: CambioEstadoRequest = { estado: 'arreglando', descripcion: 'Empezamos hoy' };
    const respuesta = { id: 9, estado: 'arreglando' } as OrdenDetalle;
    let emitido: OrdenDetalle | undefined;

    servicio.cambiarEstado(9, datos).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/ordenes/9/estado');
    expect(peticion.request.method).toBe('PATCH');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(respuesta);

    expect(emitido).toEqual(respuesta);
  });
});
