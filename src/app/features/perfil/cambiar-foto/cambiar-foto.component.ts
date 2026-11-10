import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { FotoPerfilService } from '@core/services/foto-perfil.service';
import { ToastService } from '@core/services/toast.service';
import { recuperarFoco } from '@core/util/foco';
import { archivoACuadrado, recortarCuadrado } from '@core/util/imagen';

type Vista = 'opciones' | 'camara';

function detener(flujo: MediaStream | null): void {
  flujo?.getTracks().forEach((pista) => pista.stop());
}

function mensajeDeCamara(error: unknown): string {
  return error instanceof DOMException && error.name === 'NotAllowedError'
    ? 'No has dado permiso para usar la cámara. Actívalo en el navegador o elige una foto de la galería.'
    : 'No se ha podido acceder a la cámara. Prueba a elegir una foto de la galería.';
}

@Component({
  selector: 'app-cambiar-foto',
  templateUrl: './cambiar-foto.component.html',
  styleUrl: './cambiar-foto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CambiarFotoComponent {
  readonly abierto = input(false, { transform: booleanAttribute });
  readonly cerrar = output<void>();

  private readonly fotos = inject(FotoPerfilService);
  private readonly toast = inject(ToastService);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  private readonly camaraNativa = viewChild.required<ElementRef<HTMLInputElement>>('camaraNativa');

  protected readonly foto = this.fotos.foto;
  protected readonly vista = signal<Vista>('opciones');
  protected readonly flujo = signal<MediaStream | null>(null);
  protected readonly camaraLista = signal(false);
  protected readonly errorCamara = signal<string | null>(null);

  // Si se sale mientras el navegador pide permiso, la cámara concedida después debe apagarse
  private peticionCamara = 0;

  constructor() {
    afterRenderEffect(() => {
      const dialogo = this.dialogo().nativeElement;

      if (this.abierto() && !dialogo.open) {
        dialogo.showModal();
      } else if (!this.abierto() && dialogo.open) {
        dialogo.close();
        recuperarFoco();
      }
    });

    inject(DestroyRef).onDestroy(() => this.apagarCamara());
  }

  // Sin getUserMedia (por ejemplo, en una página sin HTTPS) se usa la cámara nativa del móvil
  protected async usarCamara(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.camaraNativa().nativeElement.click();
      return;
    }

    this.vista.set('camara');
    this.errorCamara.set(null);
    const peticion = ++this.peticionCamara;

    try {
      const flujo = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      if (peticion === this.peticionCamara) {
        this.flujo.set(flujo);
      } else {
        detener(flujo);
      }
    } catch (error: unknown) {
      if (peticion === this.peticionCamara) {
        this.errorCamara.set(mensajeDeCamara(error));
      }
    }
  }

  protected capturar(): void {
    const video = this.video()?.nativeElement;
    if (video !== undefined) {
      this.guardar(recortarCuadrado(video, video.videoWidth, video.videoHeight));
    }
  }

  protected async alElegirArchivo(evento: Event): Promise<void> {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0];
    entrada.value = ''; // permite volver a elegir el mismo archivo

    if (archivo === undefined) {
      return;
    }

    try {
      this.guardar(await archivoACuadrado(archivo));
    } catch {
      this.toast.error('No se ha podido leer la imagen. Prueba con otra foto.');
    }
  }

  protected eliminar(): void {
    this.fotos.eliminar();
    this.toast.exito('Foto de perfil eliminada');
    this.salir();
  }

  protected volverAOpciones(): void {
    this.apagarCamara();
    this.vista.set('opciones');
  }

  protected salir(): void {
    this.volverAOpciones();
    this.cerrar.emit();
  }

  // Si sigue abierto para el componente padre, el cierre viene del navegador (tecla Escape)
  protected alCerrar(): void {
    if (this.abierto()) {
      this.salir();
    }
  }

  private guardar(foto: string): void {
    this.fotos.guardar(foto);
    this.toast.exito('Foto de perfil actualizada');
    this.salir();
  }

  private apagarCamara(): void {
    this.peticionCamara++;
    detener(this.flujo());
    this.flujo.set(null);
    this.camaraLista.set(false);
  }
}
