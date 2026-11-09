import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { Pagina, Pieza } from '@core/models';
import { PiezasService } from './piezas.service';

const VACIA: Pagina<Pieza> = { datos: [], pagina: 1, limite: 20, total: 0, totalPaginas: 0 };

describe('PiezasService', () => {
  let servicio: PiezasService;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(PiezasService);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('listar envía los filtros con valor y emite la página', () => {
    const respuesta: Pagina<Pieza> = {
      ...VACIA,
      datos: [
        {
          id: 1,
          referencia: 'DS-118',
          nombre: 'Disco de freno',
          precio: 36,
          stock: 4,
          activa: true,
          stockBajo: false
        }
      ],
      total: 1,
      totalPaginas: 1
    };
    let emitido: Pagina<Pieza> | undefined;

    servicio
      .listar({ q: 'disco', soloActivas: true, stockBajo: true, pagina: 2, limite: 10 })
      .subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne(
      '/api/v1/piezas?q=disco&soloActivas=true&stockBajo=true&pagina=2&limite=10'
    );
    expect(peticion.request.method).toBe('GET');
    peticion.flush(respuesta);

    expect(emitido).toEqual(respuesta);
  });

  it('listar conserva soloActivas = false', () => {
    servicio.listar({ soloActivas: false }).subscribe();

    httpSimulado.expectOne('/api/v1/piezas?soloActivas=false').flush(VACIA);
  });

  it('listar omite los parámetros sin valor', () => {
    servicio.listar({ q: '   ', stockBajo: null, pagina: undefined }).subscribe();

    httpSimulado.expectOne('/api/v1/piezas').flush(VACIA);
  });
});
