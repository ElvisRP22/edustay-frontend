import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilEstudianteRequest, PerfilEstudianteResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly base = '/api/perfil';

  constructor(private http: HttpClient) {}

  /** GET /api/perfil — perfil propio del usuario autenticado */
  getMiPerfil(): Observable<PerfilEstudianteResponse> {
    return this.http.get<PerfilEstudianteResponse>(this.base);
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
