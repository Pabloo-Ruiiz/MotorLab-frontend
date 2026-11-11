import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  LineaCreada,
  LineaRequest,
  Presupuesto,
  PresupuestoUpdateRequest,
  RechazoRequest,
  SesionPago,
  Totales
} from '@core/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class PresupuestosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/presupuestos`;
  private readonly urlOrdenes = `${environment.apiUrl}/ordenes`;

  obtenerPorOrden(ordenId: number): Observable<Presupuesto> {
    return this.http.get<Presupuesto>(`${this.urlOrdenes}/${ordenId}/presupuesto`);
  }

  crear(ordenId: number): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${this.urlOrdenes}/${ordenId}/presupuesto`, null);
  }

  actualizar(id: number, datos: PresupuestoUpdateRequest): Observable<Presupuesto> {
    return this.http.patch<Presupuesto>(`${this.url}/${id}`, datos);
  }

  anadirLinea(id: number, datos: LineaRequest): Observable<LineaCreada> {
    return this.http.post<LineaCreada>(`${this.url}/${id}/lineas`, datos);
  }

  modificarLinea(id: number, lineaId: number, datos: LineaRequest): Observable<LineaCreada> {
    return this.http.put<LineaCreada>(`${this.url}/${id}/lineas/${lineaId}`, datos);
  }

  eliminarLinea(id: number, lineaId: number): Observable<Totales> {
    return this.http.delete<Totales>(`${this.url}/${id}/lineas/${lineaId}`);
  }

  enviar(id: number): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${this.url}/${id}/enviar`, null);
  }

  autorizar(id: number): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${this.url}/${id}/autorizar`, null);
  }

  rechazar(id: number, motivo?: string | null): Observable<Presupuesto> {
    const cuerpo: RechazoRequest = { motivo };
    return this.http.post<Presupuesto>(`${this.url}/${id}/rechazar`, cuerpo);
  }

  // El importe lo calcula el backend: el navegador solo indica qué presupuesto quiere pagar
  iniciarPago(id: number): Observable<SesionPago> {
    return this.http.post<SesionPago>(`${this.url}/${id}/pago`, null);
  }

  // El cliente pagará en el taller al recoger el vehículo
  elegirEfectivo(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/pago/efectivo`, null);
  }

  // Solo administración: el taller ha recibido el importe en mano
  cobrarEfectivo(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/cobro-efectivo`, null);
  }
}
