import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabitacionCatalogItem, HabitacionRequest, HabitacionResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  private readonly base = '/api/habitaciones';
  private readonly catalogosBase = '/api/catalogos/habitaciones';

  constructor(private http: HttpClient) {}

  /** GET /api/habitaciones/buscar — buscar con geolocalización y filtros */
  buscarConFiltros(params: {
    lat?: number;
    lon?: number;
    radioKm?: number;
    maxPrecio?: number;
    query?: string;
    soloDisponibles?: boolean;
  }): Observable<HabitacionResponse[]> {
    let httpParams = new HttpParams();
    if (params.lat !== undefined && params.lat !== null) httpParams = httpParams.set('lat', params.lat.toString());
    if (params.lon !== undefined && params.lon !== null) httpParams = httpParams.set('lon', params.lon.toString());
    if (params.radioKm !== undefined && params.radioKm !== null) httpParams = httpParams.set('radioKm', params.radioKm.toString());
    if (params.maxPrecio !== undefined && params.maxPrecio !== null) httpParams = httpParams.set('maxPrecio', params.maxPrecio.toString());
    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.soloDisponibles !== undefined && params.soloDisponibles !== null) httpParams = httpParams.set('soloDisponibles', params.soloDisponibles.toString());

    return this.http.get<HabitacionResponse[]>(`${this.base}/buscar`, { params: httpParams });
  }

  /** GET /api/habitaciones — todas las habitaciones */
  getAll(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.base);
  }

  /** GET /api/habitaciones/estado/disponibles */
  getDisponibles(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(`${this.base}/estado/disponibles`);
  }

  /** GET /api/catalogos/habitaciones/servicios */
  getServiciosCatalogo(): Observable<HabitacionCatalogItem[]> {
    return this.http.get<HabitacionCatalogItem[]>(`${this.catalogosBase}/servicios`);
  }

  /** GET /api/catalogos/habitaciones/reglas */
  getReglasCatalogo(): Observable<HabitacionCatalogItem[]> {
    return this.http.get<HabitacionCatalogItem[]>(`${this.catalogosBase}/reglas`);
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
