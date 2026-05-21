import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DocumentoVerificacionRequest,
  VerificacionAdminResponse,
  VerificacionRequest,
  VerificacionResponse
} from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentosService {
  private readonly baseDocumentos = `${environment.apiBaseUrl}/documentos`;
  private readonly baseVerificaciones = `${environment.apiBaseUrl}/verificaciones`;

  constructor(private http: HttpClient) {}

  // ── Documentos de Verificación ─────────────────────────────────────────────

  /** POST /api/documentos */
  subirDocumento(data: DocumentoVerificacionRequest): Observable<VerificacionResponse> {
    return this.http.post<VerificacionResponse>(this.baseDocumentos, data);
  }

  /** GET /api/documentos/mis-documentos */
  getMisDocumentos(): Observable<VerificacionResponse[]> {
    return this.http.get<VerificacionResponse[]>(`${this.baseDocumentos}/mis-documentos`);
  }

  // ── Verificaciones (Admin) ─────────────────────────────────────────────────

  /** GET /api/verificaciones */
  getTodos(): Observable<VerificacionAdminResponse[]> {
    return this.http.get<VerificacionAdminResponse[]>(this.baseVerificaciones);
  }

  /** GET /api/verificaciones/pendientes */
  getPendientes(): Observable<VerificacionAdminResponse[]> {
    return this.http.get<VerificacionAdminResponse[]>(`${this.baseVerificaciones}/pendientes`);
  }

  /** GET /api/verificaciones/usuario/:usuarioId */
  getByUsuario(usuarioId: number): Observable<unknown> {
    return this.http.get(`${this.baseVerificaciones}/usuario/${usuarioId}`);
  }

  /** PATCH /api/verificaciones/:id */
  actualizarEstado(id: number, data: VerificacionRequest): Observable<VerificacionAdminResponse> {
    return this.http.patch<VerificacionAdminResponse>(`${this.baseVerificaciones}/${id}`, data);
  }
}
