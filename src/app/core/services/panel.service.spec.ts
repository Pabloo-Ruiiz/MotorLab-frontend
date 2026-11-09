import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { Metricas } from '@core/models';
import { PanelService } from './panel.service';

describe('PanelService', () => {
  let servicio: PanelService;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(PanelService);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('metricas envía GET /panel/metricas y emite las métricas', () => {
    const respuesta: Metricas = {
      ordenesActivas: 12,
      ordenesPorEstado: { arreglando: 2, listo: 1 },
      ingresosMes: 1840.35,
      presupuestosSinRespuesta: 4,
      piezasStockBajo: 1
    };
    let emitido: Metricas | undefined;

    servicio.metricas().subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/panel/metricas');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(respuesta);

    expect(emitido).toEqual(respuesta);
  });
});
