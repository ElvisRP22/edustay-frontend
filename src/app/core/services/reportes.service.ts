import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteRequest, ReporteResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly base = '/api/reportes';

  constructor(private http: HttpClient) {}

  /** GET /api/reportes — todos (admin) */
  getAll(): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(this.base);
  }

  /** GET /api/reportes/mis-reportes */
  getMisReportes(): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(`${this.base}/mis-reportes`);
  }

  /** GET /api/reportes/habitacion/:habitacionId */
  getByHabitacion(habitacionId: number): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(`${this.base}/habitacion/${habitacionId}`);
  }

  /** POST /api/reportes */
  crear(data: ReporteRequest): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(this.base, data);
  }
}
