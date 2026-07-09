import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MensajeResponse,
  PermissionCatalogResponse,
  RolePermissionRequest,
  RolePermissionResponse,
  RolesPermissionsSummaryResponse,
  UsuarioAdminResponse
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseAdmin = `${environment.apiBaseUrl}/admin`;
  private readonly baseRolesPermisos = `${environment.apiBaseUrl}/admin/roles-permisos`;

  constructor(private http: HttpClient) { }

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

  /** GET /api/admin/roles-permisos */
  getRolesPermisos(): Observable<RolePermissionResponse[]> {
    return this.http.get<RolePermissionResponse[]>(this.baseRolesPermisos);
  }

  /** GET /api/admin/roles-permisos/permisos */
  getCatalogoPermisos(): Observable<PermissionCatalogResponse[]> {
    return this.http.get<PermissionCatalogResponse[]>(`${this.baseRolesPermisos}/permisos`);
  }

  /** GET /api/admin/roles-permisos/resumen */
  getResumenRolesPermisos(): Observable<RolesPermissionsSummaryResponse> {
    return this.http.get<RolesPermissionsSummaryResponse>(`${this.baseRolesPermisos}/resumen`);
  }

  /** POST /api/admin/roles-permisos/roles */
  crearRol(data: RolePermissionRequest): Observable<RolePermissionResponse> {
    return this.http.post<RolePermissionResponse>(`${this.baseRolesPermisos}/roles`, data);
  }

  /** PATCH /api/admin/roles-permisos/roles/:id */
  actualizarRol(id: number, data: RolePermissionRequest): Observable<RolePermissionResponse> {
    return this.http.patch<RolePermissionResponse>(`${this.baseRolesPermisos}/roles/${id}`, data);
  }

  /** PATCH /api/admin/roles-permisos/roles/:id/permisos/:permissionId */
  alternarPermiso(id: number, permissionId: number): Observable<RolePermissionResponse> {
    return this.http.patch<RolePermissionResponse>(`${this.baseRolesPermisos}/roles/${id}/permisos/${permissionId}`, {});
  }

  /** POST /api/admin/roles-permisos/roles/:id/restaurar */
  restaurarPermisos(id: number): Observable<RolePermissionResponse> {
    return this.http.post<RolePermissionResponse>(`${this.baseRolesPermisos}/roles/${id}/restaurar`, {});
  }
}
