import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NotificacionesService } from './notificaciones.service';

describe('NotificacionesService', () => {
  let servicio: NotificacionesService;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(NotificacionesService);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('listar envía leida = false y omite los filtros sin valor', () => {
    servicio.listar({ leida: false, pagina: 2, limite: null }).subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/notificaciones?leida=false&pagina=2');
    expect(peticion.request.method).toBe('GET');
    peticion.flush({ datos: [], pagina: 2, limite: 20, total: 0, totalPaginas: 0 });
  });

  it('listar sin filtros no añade parámetros a la URL', () => {
    servicio.listar().subscribe();

    httpSimulado
      .expectOne('/api/v1/notificaciones')
      .flush({ datos: [], pagina: 1, limite: 20, total: 0, totalPaginas: 0 });
  });

  it('marcarLeida hace PATCH sin cuerpo', () => {
    servicio.marcarLeida(5).subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/notificaciones/5/leida');
    expect(peticion.request.method).toBe('PATCH');
    expect(peticion.request.body).toBeNull();
    peticion.flush({});
  });

  it.each([
    ['el número documentado', 3],
    ['el objeto del backend', { no_leidas: 3 }]
  ])('contador emite un número al recibir %s', (_caso, respuesta) => {
    let emitido: number | undefined;

    servicio.contador().subscribe((valor) => (emitido = valor));
    httpSimulado.expectOne('/api/v1/notificaciones/contador').flush(respuesta);

    expect(emitido).toBe(3);
  });

  it.each([
    ['el número documentado', 4],
    ['el objeto del backend', { marcadas: 4 }]
  ])('marcarTodas emite un número al recibir %s', (_caso, respuesta) => {
    let emitido: number | undefined;

    servicio.marcarTodas().subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/notificaciones/marcar-todas');
    expect(peticion.request.method).toBe('POST');
    peticion.flush(respuesta);

    expect(emitido).toBe(4);
  });
});
