import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { Pagina, Usuario, UsuarioCreateRequest } from '@core/models';
import { UsuariosService } from './usuarios.service';

const MECANICO: Usuario = {
  id: 4,
  nombre: 'Javi Soler',
  email: 'javi@taller.example',
  telefono: '600111222',
  rol: 'mecanico',
  activo: true
};

function pagina(datos: Usuario[]): Pagina<Usuario> {
  return { datos, pagina: 1, limite: 100, total: datos.length, totalPaginas: 1 };
}

describe('UsuariosService', () => {
  let servicio: UsuariosService;
  let httpSimulado: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(UsuariosService);
    httpSimulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpSimulado.verify();
  });

  it('listar envía los filtros con valor y omite los vacíos', () => {
    servicio.listar({ rol: 'cliente', pagina: 2, limite: null }).subscribe();

    const peticion = httpSimulado.expectOne('/api/v1/usuarios?rol=cliente&pagina=2');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(pagina([]));
  });

  it('listar sin filtros no añade parámetros a la URL', () => {
    let emitido: Pagina<Usuario> | undefined;
    const respuesta = pagina([MECANICO]);

    servicio.listar().subscribe((valor) => (emitido = valor));
    httpSimulado.expectOne('/api/v1/usuarios').flush(respuesta);

    expect(emitido).toEqual(respuesta);
  });

  it('crear hace POST con los datos y emite el usuario', () => {
    const datos: UsuarioCreateRequest = {
      nombre: 'Javi Soler',
      email: 'javi@taller.example',
      telefono: '600111222',
      password: 'Secreta123',
      rol: 'mecanico'
    };
    let emitido: Usuario | undefined;

    servicio.crear(datos).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/usuarios');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush(MECANICO, { status: 201, statusText: 'Created' });

    expect(emitido).toEqual(MECANICO);
  });

  it('actualizar hace PATCH con los datos y emite el usuario', () => {
    const desactivado: Usuario = { ...MECANICO, activo: false };
    let emitido: Usuario | undefined;

    servicio.actualizar(4, { activo: false }).subscribe((valor) => (emitido = valor));

    const peticion = httpSimulado.expectOne('/api/v1/usuarios/4');
    expect(peticion.request.method).toBe('PATCH');
    expect(peticion.request.body).toEqual({ activo: false });
    peticion.flush(desactivado);

    expect(emitido).toEqual(desactivado);
  });

  it('listarMecanicos pide rol mecanico con límite 100 y deja solo los activos', () => {
    const inactivo: Usuario = { ...MECANICO, id: 5, activo: false };
    let emitido: Usuario[] | undefined;

    servicio.listarMecanicos().subscribe((valor) => (emitido = valor));

    httpSimulado
      .expectOne('/api/v1/usuarios?rol=mecanico&limite=100')
      .flush(pagina([MECANICO, inactivo]));

    expect(emitido).toEqual([MECANICO]);
  });
});
