import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AuthService } from '@core/services/auth.service';
import { FotoPerfilService } from '@core/services/foto-perfil.service';
import { ToastService } from '@core/services/toast.service';

import { CambiarFotoComponent } from './cambiar-foto.component';

describe('CambiarFotoComponent', () => {
  const FOTO = 'data:image/jpeg;base64,AAAA';
  const GALERIA = 'input[type="file"]:not([capture])';
  const CAMARA_NATIVA = 'input[type="file"][capture]';

  let fixture: ComponentFixture<CambiarFotoComponent>;
  let elemento: HTMLElement;
  let toast: { exito: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  const descriptorMedia = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');

  function simularMedia(getUserMedia?: () => Promise<unknown>): void {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: getUserMedia === undefined ? undefined : { getUserMedia },
    });
  }

  function boton(texto: string): HTMLButtonElement {
    const encontrado = [...elemento.querySelectorAll('button')].find((candidato) =>
      candidato.textContent?.includes(texto),
    );
    if (encontrado === undefined) {
      throw new Error(`No existe el botón «${texto}»`);
    }
    return encontrado;
  }

  function elegirArchivo(): void {
    const entrada = elemento.querySelector(GALERIA) as HTMLInputElement;
    Object.defineProperty(entrada, 'files', {
      configurable: true,
      value: [new File(['x'], 'foto.png', { type: 'image/png' })],
    });
    entrada.dispatchEvent(new Event('change'));
  }

  beforeEach(async () => {
    localStorage.clear();
    toast = { exito: vi.fn(), error: vi.fn() };

    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({
        width: 400,
        height: 200,
        close: vi.fn(),
      }),
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as RenderingContext);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(FOTO);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { usuario: signal({ id: 5 }) } },
        { provide: ToastService, useValue: toast },
      ],
    });

    fixture = TestBed.createComponent(CambiarFotoComponent);
    fixture.componentRef.setInput('abierto', true);
    elemento = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (descriptorMedia === undefined) {
      delete (navigator as { mediaDevices?: unknown }).mediaDevices;
    } else {
      Object.defineProperty(navigator, 'mediaDevices', descriptorMedia);
    }
  });

  it('ofrece la cámara y la galería, y la galería solo acepta imágenes', () => {
    expect(boton('Tomar foto con la cámara')).toBeDefined();
    expect(boton('Seleccionar de la galería')).toBeDefined();
    expect(elemento.querySelector(GALERIA)?.getAttribute('accept')).toBe('image/*');
  });

  it('guarda la imagen elegida para este usuario y cierra el selector', async () => {
    const cerrar = vi.fn();
    fixture.componentInstance.cerrar.subscribe(cerrar);

    elegirArchivo();

    await vi.waitFor(() => expect(cerrar).toHaveBeenCalled());
    expect(TestBed.inject(FotoPerfilService).foto()).toBe(FOTO);
    expect(localStorage.getItem('motorlab.foto.5')).toBe(FOTO);
    expect(toast.exito).toHaveBeenCalled();
  });

  it('avisa si el archivo no se puede leer y no cambia la foto', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('no es una imagen')));

    elegirArchivo();

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(TestBed.inject(FotoPerfilService).foto()).toBeNull();
  });

  it('sin foto propia no ofrece eliminarla', () => {
    expect(elemento.textContent).not.toContain('Eliminar foto actual');
  });

  it('elimina la foto guardada, vuelve a las iniciales y cierra el selector', async () => {
    const fotos = TestBed.inject(FotoPerfilService);
    const cerrar = vi.fn();
    fixture.componentInstance.cerrar.subscribe(cerrar);
    fotos.guardar(FOTO);
    await fixture.whenStable();

    boton('Eliminar foto actual').click();

    expect(fotos.foto()).toBeNull();
    expect(localStorage.getItem('motorlab.foto.5')).toBeNull();
    expect(toast.exito).toHaveBeenCalledWith('Foto de perfil eliminada');
    expect(cerrar).toHaveBeenCalled();
  });

  it('sin getUserMedia abre la cámara nativa', () => {
    simularMedia();
    const clic = vi.spyOn(elemento.querySelector(CAMARA_NATIVA) as HTMLInputElement, 'click');

    boton('Tomar foto').click();

    expect(clic).toHaveBeenCalled();
  });

  it('explica el problema si se deniega el permiso de la cámara', async () => {
    simularMedia(() => Promise.reject(new DOMException('denegado', 'NotAllowedError')));

    boton('Tomar foto').click();

    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('permiso');
    });
  });

  it('apaga la cámara si se concede el permiso después de salir', async () => {
    const stop = vi.fn();
    let conceder: (flujo: unknown) => void = () => undefined;
    simularMedia(() => new Promise((resolver) => (conceder = resolver)));

    boton('Tomar foto').click();
    await fixture.whenStable();
    boton('Volver').click();
    conceder({ getTracks: () => [{ stop }] });

    await vi.waitFor(() => expect(stop).toHaveBeenCalled());
  });
});
