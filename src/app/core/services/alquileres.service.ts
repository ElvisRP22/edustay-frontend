import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlquilerRequest, AlquilerResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AlquileresService {
  private readonly base = '/api/alquileres';

  constructor(private http: HttpClient) {}

  /** GET /api/alquileres — todos (admin) */
  getAll(): Observable<AlquilerResponse[]> {
    return this.http.get<AlquilerResponse[]>(this.base);
  }

  /** GET /api/alquileres/:id */
  getById(id: number): Observable<AlquilerResponse> {
    return this.http.get<AlquilerResponse>(`${this.base}/${id}`);
  }

  /** GET /api/alquileres/mis-alquileres — del estudiante autenticado */
  getMisAlquileres(): Observable<AlquilerResponse[]> {
    return this.http.get<AlquilerResponse[]>(`${this.base}/mis-alquileres`);
  }

  /** GET /api/alquileres/mis-arrendamientos — del arrendador autenticado */
  getMisArrendamientos(): Observable<AlquilerResponse[]> {
    return this.http.get<AlquilerResponse[]>(`${this.base}/mis-arrendamientos`);
  }

  /** POST /api/alquileres */
  crear(data: AlquilerRequest): Observable<AlquilerResponse> {
    return this.http.post<AlquilerResponse>(this.base, data);
  }

  /** DELETE /api/alquileres/:id — finalizar */
  finalizar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
