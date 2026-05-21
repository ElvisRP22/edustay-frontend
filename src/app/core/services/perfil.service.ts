import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PerfilEstudianteRequest,
  PerfilEstudianteResponse,
  PerfilVerificacionResponse
} from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly base = `${environment.apiBaseUrl}/perfil`;

  constructor(private http: HttpClient) {}

  /** GET /api/perfil — perfil propio del usuario autenticado */
  getMiPerfil(): Observable<PerfilEstudianteResponse> {
    return this.http.get<PerfilEstudianteResponse>(this.base);
  }

  /** GET /api/perfil/verificacion */
  getVerificacion(): Observable<PerfilVerificacionResponse> {
    return this.http.get<PerfilVerificacionResponse>(`${this.base}/verificacion`);
  }

  /** GET /api/perfil/:usuarioId */
  getPerfilById(usuarioId: number): Observable<PerfilEstudianteResponse> {
    return this.http.get<PerfilEstudianteResponse>(`${this.base}/${usuarioId}`);
  }

  /** PUT /api/perfil */
  guardarMiPerfil(data: PerfilEstudianteRequest): Observable<PerfilEstudianteResponse> {
    return this.http.put<PerfilEstudianteResponse>(this.base, data);
  }
}
