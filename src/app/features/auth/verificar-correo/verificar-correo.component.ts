import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { mensajeDeError } from '@core/util/api-error';
import { LogoComponent } from '@shared/components/logo/logo.component';

const ENLACE_INCOMPLETO = 'El enlace no es válido. Inicia sesión para pedir uno nuevo.';

@Component({
  selector: 'app-verificar-correo',
  imports: [LogoComponent, RouterLink],
  templateUrl: './verificar-correo.component.html',
  styleUrl: './verificar-correo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificarCorreoComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly estado = signal<'verificando' | 'confirmado' | 'error'>('verificando');
  protected readonly error = signal(ENLACE_INCOMPLETO);

  ngOnInit(): void {
    const token = this.ruta.snapshot.queryParamMap.get('token');

    if (!token) {
      this.estado.set('error');
      return;
    }

    this.auth.verificarEmail(token).subscribe({
      next: () => this.estado.set('confirmado'),
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.estado.set('error');
      }
    });
  }
}
