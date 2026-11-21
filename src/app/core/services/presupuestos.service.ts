import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type {
  LineaCreada,
  LineaRequest,
  Presupuesto,
  PresupuestoDefinitivo,
  PresupuestoUpdateRequest,
  RechazoRequest,
  SesionPago,
  Totales
} from '@core/models';
import { environment } from '@env/environment';

// «attachment; filename="presupuesto-PD-2026-00012.pdf"» → presupuesto-PD-2026-00012.pdf
function nombreDeArchivo(cabecera: string | null): string | null {
  return cabecera?.match(/filename="?([^";]+)"?/)?.[1] ?? null;
}

@Injectable({ providedIn: 'root' })
export class PresupuestosService {
  private readonly http = inject(HttpClient);
  private readonly documento = inject(DOCUMENT);
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

  // Solo existe cuando la reparación ha finalizado (orden en «listo» o «entregado»); antes responde 404
  obtenerDefinitivo(ordenId: number): Observable<PresupuestoDefinitivo> {
    return this.http.get<PresupuestoDefinitivo>(`${this.urlOrdenes}/${ordenId}/presupuesto-definitivo`);
  }

  // Descarga el PDF y lo guarda en el equipo con el nombre que da el servidor
  descargarDefinitivo(ordenId: number): Observable<void> {
    return this.http
      .get(`${this.urlOrdenes}/${ordenId}/presupuesto-definitivo/pdf`, {
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(
        map((respuesta) => {
          const nombre =
            nombreDeArchivo(respuesta.headers.get('Content-Disposition')) ??
            `presupuesto-orden-${ordenId}.pdf`;
          this.guardar(respuesta.body ?? new Blob(), nombre);
        })
      );
  }

  private guardar(contenido: Blob, nombre: string): void {
    const url = URL.createObjectURL(contenido);
    const enlace = this.documento.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    this.documento.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url));
  }
}
