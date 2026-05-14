import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensajeRequest, MensajeResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private readonly base = '/api/mensajes';

  constructor(private http: HttpClient) {}

  /** POST /api/mensajes */
  enviar(data: MensajeRequest): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(this.base, data);
  }

  /** GET /api/mensajes/bandeja */
  getBandeja(): Observable<MensajeResponse[]> {
    return this.http.get<MensajeResponse[]>(`${this.base}/bandeja`);
  }

  /** GET /api/mensajes/conversacion?habitacionId=&otroUsuarioId= */
  getConversacion(habitacionId: number, otroUsuarioId: number): Observable<MensajeResponse[]> {
    const params = new HttpParams()
      .set('habitacionId', habitacionId)
      .set('otroUsuarioId', otroUsuarioId);
    return this.http.get<MensajeResponse[]>(`${this.base}/conversacion`, { params });
  }

  /** GET /api/mensajes/no-leidos */
  getNoLeidos(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.base}/no-leidos`);
  }

  /** PATCH /api/mensajes/conversacion/leer?habitacionId=&emisorId= */
  marcarLeidos(habitacionId: number, emisorId: number): Observable<void> {
    const params = new HttpParams()
      .set('habitacionId', habitacionId)
      .set('emisorId', emisorId);
    return this.http.patch<void>(`${this.base}/conversacion/leer`, {}, { params });
  }
}
