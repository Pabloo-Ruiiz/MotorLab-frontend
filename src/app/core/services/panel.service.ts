import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Metricas } from '@core/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/panel`;

  metricas(): Observable<Metricas> {
    return this.http.get<Metricas>(`${this.url}/metricas`);
  }
}
