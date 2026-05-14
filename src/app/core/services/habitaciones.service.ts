import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabitacionRequest, HabitacionResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  private readonly base = '/api/habitaciones';

  constructor(private http: HttpClient) {}

  /** GET /api/habitaciones — todas las habitaciones */
  getAll(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.base);
  }

  /** GET /api/habitaciones/estado/disponibles */
  getDisponibles(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(`${this.base}/estado/disponibles`);
  }

  /** GET /api/habitaciones/:id */
  getById(id: number): Observable<HabitacionResponse> {
    return this.http.get<HabitacionResponse>(`${this.base}/${id}`);
  }

  /** GET /api/habitaciones/arrendador/:arrendadorId */
  getByArrendador(arrendadorId: number): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(`${this.base}/arrendador/${arrendadorId}`);
  }

  /** POST /api/habitaciones */
  crear(data: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.post<HabitacionResponse>(this.base, data);
  }

  /** PUT /api/habitaciones/:id */
  actualizar(id: number, data: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(`${this.base}/${id}`, data);
  }

  /** DELETE /api/habitaciones/:id */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
