import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabitacionResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly base = '/api/favoritos';

  constructor(private http: HttpClient) {}

  /** GET /api/favoritos — mis favoritos */
  getMisFavoritos(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.base);
  }

  /** GET /api/favoritos/:habitacionId/check */
  esFavorito(habitacionId: number): Observable<{ [key: string]: boolean }> {
    return this.http.get<{ [key: string]: boolean }>(`${this.base}/${habitacionId}/check`);
  }

  /** POST /api/favoritos/:habitacionId */
  agregar(habitacionId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${habitacionId}`, {});
  }

  /** DELETE /api/favoritos/:habitacionId */
  eliminar(habitacionId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${habitacionId}`);
  }
}
