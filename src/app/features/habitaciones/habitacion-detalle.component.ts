import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { FavoritosService } from '../../core/services/favoritos.service';
import { ResenasService } from '../../core/services/resenas.service';
import { ReportesService } from '../../core/services/reportes.service';
import { AlquileresService } from '../../core/services/alquileres.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { AuthService } from '../../core/services/auth.service';
import { HabitacionCatalogItem, HabitacionResponse, ResenaResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';

@Component({
  selector: 'app-habitacion-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './habitacion-detalle.component.html',
  styleUrl: './habitacion-detalle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitacionDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(HabitacionesService);
  private favSvc = inject(FavoritosService);
  private resenaSvc = inject(ResenasService);
  private reporteSvc = inject(ReportesService);
  private alquilerSvc = inject(AlquileresService);
  private mensajeSvc = inject(MensajesService);
  auth = inject(AuthService);

  habitacion = signal<HabitacionResponse | null>(null);
  resenas = signal<ResenaResponse[]>([]);
  esFavorito = signal(false);
  loading = signal(true);
  loadingFav = signal(false);
  loadingAlquiler = signal(false);

  // Mensaje rápido
  mensajeTexto = signal('');
  mensajeOk = signal(false);
  mensajeError = signal<string | null>(null);

  // Reseña nueva
  nuevaCalif = signal(5);
  nuevoComentario = signal('');
  resenaOk = signal(false);

  // Reporte
  showReporte = signal(false);
  reporteMotivo = signal('');
  reporteDesc = signal('');
  reporteOk = signal(false);

  // Alquiler
  montoPactado = signal<number>(0);
  alquilerOk = signal(false);
  alquilerError = signal<string | null>(null);
  showAlquiler = signal(false);

  get id() { return Number(this.route.snapshot.paramMap.get('id')); }

  ngOnInit() {
    this.svc.getById(this.id).subscribe({
      next: h => {
        this.habitacion.set(h);
        this.montoPactado.set(h.precio);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });

    this.resenaSvc.getByHabitacion(this.id).subscribe({
      next: r => this.resenas.set(r)
    });

    if (this.auth.isAuthenticated()) {
      this.favSvc.esFavorito(this.id).subscribe({
        next: r => this.esFavorito.set(Object.values(r)[0] ?? false)
      });
    }
  }

  toggleFav() {
    if (!this.auth.isAuthenticated()) { this.router.navigate(['/login']); return; }
    this.loadingFav.set(true);
    const obs = this.esFavorito()
      ? this.favSvc.eliminar(this.id)
      : this.favSvc.agregar(this.id);
    obs.subscribe({
      next: () => { this.esFavorito.update(v => !v); this.loadingFav.set(false); },
      error: () => this.loadingFav.set(false)
    });
  }

  enviarMensaje() {
    const h = this.habitacion();
    if (!h || !this.mensajeTexto().trim()) return;
    this.mensajeSvc.enviar({
      receptorId: h.arrendadorId,
      habitacionId: h.id,
      contenido: this.mensajeTexto()
    }).subscribe({
      next: () => { this.mensajeOk.set(true); this.mensajeTexto.set(''); },
      error: () => this.mensajeError.set('No se pudo enviar el mensaje.')
    });
  }

  crearResena() {
    this.resenaSvc.crear({
      habitacionId: this.id,
      calificacion: this.nuevaCalif(),
      comentario: this.nuevoComentario()
    }).subscribe({
      next: r => {
        this.resenas.update(arr => [r, ...arr]);
        this.resenaOk.set(true);
        this.nuevoComentario.set('');
      }
    });
  }

  crearReporte() {
    const h = this.habitacion();
    if (!h) return;
    this.reporteSvc.crear({
      habitacionId: h.id,
      motivo: this.reporteMotivo(),
      descripcion: this.reporteDesc()
    }).subscribe({
      next: () => { this.reporteOk.set(true); this.showReporte.set(false); }
    });
  }

  crearAlquiler() {
    this.loadingAlquiler.set(true);
    this.alquilerSvc.crear({
      habitacionId: this.id,
      montoPactado: this.montoPactado()
    }).subscribe({
      next: () => { this.alquilerOk.set(true); this.loadingAlquiler.set(false); this.showAlquiler.set(false); },
      error: err => {
        this.alquilerError.set(err?.error?.message ?? 'Error al registrar alquiler.');
        this.loadingAlquiler.set(false);
      }
    });
  }

  avgCalif() {
    const arr = this.resenas();
    if (!arr.length) return null;
    return (arr.reduce((s, r) => s + r.calificacion, 0) / arr.length).toFixed(1);
  }

  visibleCatalogos(items?: HabitacionCatalogItem[], limit = 3): HabitacionCatalogItem[] {
    return (items ?? []).slice(0, limit);
  }

  hiddenCatalogosCount(items?: HabitacionCatalogItem[], limit = 3): number {
    return Math.max((items ?? []).length - limit, 0);
  }

  catalogoLabel(item: HabitacionCatalogItem, fallbackPrefix: string, index: number): string {
    return item.nombre?.trim() || item.descripcion?.trim() || `${fallbackPrefix} ${index + 1}`;
  }

  stars(n: number) { return Array.from({ length: n }); }
}
