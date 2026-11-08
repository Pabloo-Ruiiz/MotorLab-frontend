import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { OrdenResumen, Pagina, Vehiculo, VehiculoRequest } from '@core/models';
import { VehiculosService } from './vehiculos.service';

describe('VehiculosService', () => {
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
  const datos: VehiculoRequest = {
    matricula: '4821KLB',
    marca: 'Seat',
    modelo: 'León',
    version: '1.5 TSI',
    anio: 2019,
    kilometros: 86400
  };

  let servicio: VehiculosService;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(VehiculosService);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('listar pide la página indicada y emite la respuesta paginada', () => {
    const respuesta: Pagina<Vehiculo> = {
      datos: [vehiculo],
      pagina: 2,
      limite: 10,
      total: 11,
      totalPaginas: 2
    };
    let emitido: Pagina<Vehiculo> | undefined;

    servicio.listar(2, 10).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos?pagina=2&limite=10');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(respuesta);

    expect(emitido).toEqual(respuesta);
  });

  it('obtener pide el vehículo por su id', () => {
    let emitido: Vehiculo | undefined;

    servicio.obtener(7).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos/7');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(vehiculo);

    expect(emitido).toEqual(vehiculo);
  });

  it('crear envía los datos por POST y emite el vehículo creado', () => {
    let emitido: Vehiculo | undefined;

    servicio.crear(datos).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(vehiculo, { status: 201, statusText: 'Created' });

    expect(emitido).toEqual(vehiculo);
  });

  it('actualizar envía los datos por PUT al vehículo indicado', () => {
    let emitido: Vehiculo | undefined;

    servicio.actualizar(7, datos).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos/7');
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(vehiculo);

    expect(emitido).toEqual(vehiculo);
  });

  it('darDeBaja envía DELETE y completa con la respuesta 204', () => {
    let completado = false;

    servicio.darDeBaja(7).subscribe({ complete: () => (completado = true) });

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos/7');
    expect(peticion.request.method).toBe('DELETE');
    peticion.flush(null, { status: 204, statusText: 'No Content' });

    expect(completado).toBe(true);
  });

  it('historial pide las órdenes del vehículo con su paginación', () => {
    const respuesta: Pagina<OrdenResumen> = {
      datos: [],
      pagina: 1,
      limite: 20,
      total: 0,
      totalPaginas: 0
    };
    let emitido: Pagina<OrdenResumen> | undefined;

    servicio.historial(7, 1, 20).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/vehiculos/7/historial?pagina=1&limite=20');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(respuesta);

    expect(emitido).toEqual(respuesta);
  });
});
