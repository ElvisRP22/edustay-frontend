import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioAdminResponse, MensajeResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseAdmin = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) {}

  /** GET /api/admin/usuarios */
  getUsuarios(): Observable<UsuarioAdminResponse[]> {
    return this.http.get<UsuarioAdminResponse[]>(`${this.baseAdmin}/usuarios`);
  }

  /** PATCH /api/admin/usuarios/:id/rol */
  cambiarRol(id: number, rol: string): Observable<UsuarioAdminResponse> {
    return this.http.patch<UsuarioAdminResponse>(`${this.baseAdmin}/usuarios/${id}/rol`, { rol });
  }

  /** DELETE /api/admin/usuarios/:id */
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseAdmin}/usuarios/${id}`);
  }

  /** GET /api/admin/mensajes/reportados */
  getMensajesReportados(): Observable<MensajeResponse[]> {
    return this.http.get<MensajeResponse[]>(`${this.baseAdmin}/mensajes/reportados`);
  }

  /** PATCH /api/admin/mensajes/:id/desestimar */
  desestimarMensaje(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseAdmin}/mensajes/${id}/desestimar`, {});
  }

  /** DELETE /api/admin/mensajes/:id */
  eliminarMensaje(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseAdmin}/mensajes/${id}`);
  }

  /** GET /api/admin/mensajes/historial */
  getHistorialModeracion(): Observable<MensajeResponse[]> {
    return this.http.get<MensajeResponse[]>(`${this.baseAdmin}/mensajes/historial`);
  }
}
