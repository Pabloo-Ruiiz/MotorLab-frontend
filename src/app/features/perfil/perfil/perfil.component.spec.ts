import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Usuario } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { FotoPerfilService } from '@core/services/foto-perfil.service';

import { PerfilComponent } from './perfil.component';

describe('PerfilComponent', () => {
  const cliente = (nombre: string): Usuario => ({
    id: 1,
    nombre,
    email: 'cliente@example.com',
    telefono: '600123123',
    rol: 'cliente',
    activo: true,
  });

  async function crear(usuario: Usuario | null) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { usuario: signal(usuario) } },
      ],
    });

    const fixture = TestBed.createComponent(PerfilComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  const textoDeBoton = (elemento: HTMLElement, texto: string) =>
    [...elemento.querySelectorAll('button')].find((boton) => boton.textContent?.includes(texto));

  beforeEach(() => localStorage.clear());

  it.each([
    ['Pablo', 'P'],
    ['  pablo   ruiz gandia ', 'PR'],
  ])('el avatar de «%s» muestra %s', async (nombre, iniciales) => {
    const { elemento } = await crear(cliente(nombre));

    expect(elemento.querySelector('.avatar')?.textContent?.trim()).toBe(iniciales);
  });

  it('muestra nombre, rol y datos de contacto sin opción de editarlos', async () => {
    const { elemento } = await crear(cliente('Pablo'));

    expect(elemento.querySelector('h1')?.textContent).toBe('Pablo');
    expect(elemento.querySelector('.pill')?.textContent).toBe('Cliente');
    expect(elemento.querySelector('.datos')?.textContent).toContain('cliente@example.com');
    expect(elemento.querySelector('.datos')?.textContent).toContain('600123123');
    expect(elemento.querySelector('.datos input')).toBeNull();
    expect(elemento.textContent).not.toContain('Editar datos');
    expect(elemento.textContent).not.toContain('Próximamente');
  });

  it('muestra la foto en cuanto se guarda', async () => {
    const { fixture, elemento } = await crear(cliente('Pablo'));

    TestBed.inject(FotoPerfilService).guardar('data:image/jpeg;base64,AAAA');
    await fixture.whenStable();

    expect(elemento.querySelector<HTMLImageElement>('.avatar__foto')?.getAttribute('src')).toBe(
      'data:image/jpeg;base64,AAAA',
    );
  });

  it('abre la política de privacidad en una pestaña nueva', async () => {
    const { elemento } = await crear(cliente('Pablo'));
    const enlace = elemento.querySelector('.perfil__nota a');

    expect(enlace?.getAttribute('href')).toBe('/privacidad');
    expect(enlace?.getAttribute('target')).toBe('_blank');
  });

  it('permite cerrar sesión aunque no se hayan podido cargar los datos', async () => {
    const { elemento } = await crear(null);

    expect(elemento.querySelector('.cuenta')).toBeNull();
    expect(textoDeBoton(elemento, 'Cerrar sesión')).toBeDefined();
  });
});
