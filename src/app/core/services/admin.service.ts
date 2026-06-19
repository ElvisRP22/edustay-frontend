import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioAdminResponse } from '../models/api.models';
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
}
