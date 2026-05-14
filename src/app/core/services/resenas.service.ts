import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResenaRequest, ResenaResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ResenasService {
  private readonly base = '/api/resenas';

  constructor(private http: HttpClient) {}

  /** GET /api/resenas/:id */
  getById(id: number): Observable<ResenaResponse> {
    return this.http.get<ResenaResponse>(`${this.base}/${id}`);
  }

  /** GET /api/resenas/habitacion/:habitacionId */
  getByHabitacion(habitacionId: number): Observable<ResenaResponse[]> {
    return this.http.get<ResenaResponse[]>(`${this.base}/habitacion/${habitacionId}`);
  }

  /** GET /api/resenas/estudiante/:estudianteId */
  getByEstudiante(estudianteId: number): Observable<ResenaResponse[]> {
    return this.http.get<ResenaResponse[]>(`${this.base}/estudiante/${estudianteId}`);
  }

  /** GET /api/resenas/validar/:estudianteId/:habitacionId */
  yaCalificada(estudianteId: number, habitacionId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/validar/${estudianteId}/${habitacionId}`);
  }

  /** POST /api/resenas */
  crear(data: ResenaRequest): Observable<ResenaResponse> {
    return this.http.post<ResenaResponse>(this.base, data);
  }

  /** PUT /api/resenas/:id */
  actualizar(id: number, data: ResenaRequest): Observable<ResenaResponse> {
    return this.http.put<ResenaResponse>(`${this.base}/${id}`, data);
  }

  /** DELETE /api/resenas/:id */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
