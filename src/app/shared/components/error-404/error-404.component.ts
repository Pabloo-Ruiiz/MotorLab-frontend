import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { pantallaInicio } from '@core/util/rutas';

@Component({
  selector: 'app-error-404',
  imports: [RouterLink],
  templateUrl: './error-404.component.html',
  styleUrl: '../error-pagina.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Error404Component {
  private readonly rol = inject(AuthService).rol;

  protected readonly inicio = computed(() => {
    const rol = this.rol();
    return rol === null ? '/login' : pantallaInicio(rol);
  });
}
