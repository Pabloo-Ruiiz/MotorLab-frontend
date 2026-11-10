import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { VehiculosService } from '@core/services/vehiculos.service';

import { buscarEnCatalogo, MARCAS, modelosDe } from './catalogo-vehiculos';
import { VehiculoFormComponent } from './vehiculo-form.component';

describe('catálogo de vehículos', () => {
  it('no repite marcas ni modelos y toda marca tiene modelos', () => {
    expect(new Set(MARCAS.map((marca) => marca.toLowerCase())).size).toBe(MARCAS.length);

    for (const marca of MARCAS) {
      const modelos = modelosDe(marca);
      expect(modelos.length, marca).toBeGreaterThan(0);
      expect(new Set(modelos).size, marca).toBe(modelos.length);
    }
  });

  it('ordena los modelos numéricos por su valor', () => {
    const modelos = modelosDe('Peugeot');
    expect(modelos.indexOf('206')).toBeLessThan(modelos.indexOf('1007'));
  });

  it('devuelve una lista vacía para una marca desconocida', () => {
    expect(modelosDe('Trabant')).toEqual([]);
    expect(modelosDe('constructor')).toEqual([]);
  });

  it('reconoce un valor sin tildes ni mayúsculas', () => {
    expect(buscarEnCatalogo(MARCAS, ' citroen ')).toBe('Citroën');
    expect(buscarEnCatalogo(MARCAS, 'Trabant')).toBeUndefined();
  });
});

describe('VehiculoFormComponent: marca y modelo', () => {
  const vehiculo = (marca: string, modelo: string) => ({
    id: 1,
    usuarioId: 1,
    matricula: '4821KLB',
    marca,
    modelo,
    version: null,
    anio: 2015,
    kilometros: 90000,
    activo: true
  });

  const select = (fixture: ComponentFixture<VehiculoFormComponent>, id: string) =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>(`#${id}`)!;

  const opciones = (elemento: HTMLSelectElement) =>
    Array.from(elemento.options).map((opcion) => opcion.value);

  async function crear(id: string | null, respuesta = vehiculo('Seat', 'León')) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: VehiculosService, useValue: { obtener: () => of(respuesta) } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(id === null ? {} : { id }) } }
        }
      ]
    });

    const fixture = TestBed.createComponent(VehiculoFormComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  async function elegir(
    fixture: ComponentFixture<VehiculoFormComponent>,
    elemento: HTMLSelectElement,
    valor: string
  ) {
    elemento.value = valor;
    elemento.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('bloquea el modelo hasta elegir una marca', async () => {
    const fixture = await crear(null);
    const modelo = select(fixture, 'vehiculo-modelo');

    expect(modelo.disabled).toBe(true);
    expect(opciones(modelo)).toEqual(['']);

    await elegir(fixture, select(fixture, 'vehiculo-marca'), 'Seat');

    expect(modelo.disabled).toBe(false);
    expect(opciones(modelo)).toContain('León');
    expect(opciones(modelo)).not.toContain('Golf');
  });

  it('vacía el modelo al cambiar de marca', async () => {
    const fixture = await crear(null);
    const marca = select(fixture, 'vehiculo-marca');
    const modelo = select(fixture, 'vehiculo-modelo');

    await elegir(fixture, marca, 'Seat');
    await elegir(fixture, modelo, 'León');
    expect(modelo.value).toBe('León');

    await elegir(fixture, marca, 'Volkswagen');

    expect(modelo.value).toBe('');
    expect(opciones(modelo)).toContain('Golf');
  });

  it('al editar adapta lo escrito a mano a la grafía del catálogo', async () => {
    const fixture = await crear('1', vehiculo('seat', 'leon'));

    expect(select(fixture, 'vehiculo-marca').value).toBe('Seat');
    expect(select(fixture, 'vehiculo-modelo').value).toBe('León');
    expect(select(fixture, 'vehiculo-modelo').disabled).toBe(false);
  });

  it('al editar indica qué vehículo se está modificando', async () => {
    const fixture = await crear('1');
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('h1')?.textContent).toContain('Editar vehículo');
    expect(elemento.querySelector('.ficha__resumen')?.textContent).toContain('Seat León · 2015');
    expect(elemento.querySelector('button[type="submit"]')?.textContent).toContain(
      'Guardar cambios'
    );
  });

  it('al editar muestra el logo de fondo; al crear, no', async () => {
    const edicion = await crear('1');
    expect((edicion.nativeElement as HTMLElement).querySelector('app-logo.filigrana')).not.toBeNull();

    TestBed.resetTestingModule();
    const nuevo = await crear(null);
    expect((nuevo.nativeElement as HTMLElement).querySelector('app-logo.filigrana')).toBeNull();
  });

  it('al crear no muestra el resumen del vehículo', async () => {
    const fixture = await crear(null);
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('h1')?.textContent).toContain('Nuevo vehículo');
    expect(elemento.querySelector('.ficha__resumen')).toBeNull();
  });

  it('al editar conserva una marca y un modelo fuera del catálogo', async () => {
    const fixture = await crear('1', vehiculo('Trabant', '601'));

    expect(select(fixture, 'vehiculo-marca').value).toBe('Trabant');
    expect(select(fixture, 'vehiculo-modelo').value).toBe('601');
  });
});
