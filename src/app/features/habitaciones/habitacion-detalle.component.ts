import {
  ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal
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
import { ToastService } from '../../core/services/toast.service';
import { HabitacionCatalogItem, HabitacionResponse, ResenaResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';

declare const L: any;

@Component({
  selector: 'app-habitacion-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './habitacion-detalle.component.html',
  styleUrl: './habitacion-detalle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitacionDetalleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(HabitacionesService);
  private favSvc = inject(FavoritosService);
  private resenaSvc = inject(ResenasService);
  private reporteSvc = inject(ReportesService);
  private alquilerSvc = inject(AlquileresService);
  private mensajeSvc = inject(MensajesService);
  auth = inject(AuthService);
  toastSvc = inject(ToastService);

  private map: any;

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
  hoverCalif = signal(0);
  nuevoComentario = signal('');
  resenaOk = signal(false);
  yaCalificada = signal(false);

  // Reporte
  showReporte = signal(false);
  reporteMotivo = signal('');
  reporteDesc = signal('');
  reporteOk = signal(false);

  // Alquiler
  montoPactado = signal<number>(0);
  contratoUrlInput = signal('');
  alquilerOk = signal(false);
  alquilerError = signal<string | null>(null);
  showAlquiler = signal(false);

  activeImageIndex = signal(0);

  getActiveImageStyle(): string {
    const h = this.habitacion();
    if (h && h.fotos && h.fotos.length > 0) {
      const idx = this.activeImageIndex();
      const url = (idx < h.fotos.length) ? h.fotos[idx] : h.fotos[0];
      return `url('${url}')`;
    }
    return 'linear-gradient(135deg, #bfdbfe 0%, #dbeafe 60%, #eff6ff 100%)';
  }

  get id() { return Number(this.route.snapshot.paramMap.get('id')); }

  ngOnInit() {
    this.svc.getById(this.id).subscribe({
      next: h => {
        this.habitacion.set(h);
        this.montoPactado.set(h.precio);
        this.loading.set(false);
        setTimeout(() => this.initMap(h), 50);
      },
      error: () => { this.loading.set(false); }
    });

    this.resenaSvc.getByHabitacion(this.id).subscribe({
      next: r => this.resenas.set(r)
    });

    if (this.auth.isAuthenticated()) {
      this.favSvc.esFavorito(this.id).subscribe({
        next: r => this.esFavorito.set(r['esFavorito'] ?? false)
      });
      if (this.auth.isEstudiante()) {
        this.resenaSvc.yaCalificada(this.auth.user()!.id, this.id).subscribe({
          next: val => {
            // Depending on response format, could be boolean or object
            const isQual = typeof val === 'object' ? Object.values(val)[0] : val;
            this.yaCalificada.set(!!isQual);
          }
        });
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  getGoogleMapsDirectionUrl(): string {
    const h = this.habitacion();
    if (!h || !h.latitud || !h.longitud) return '#';
    return `https://www.google.com/maps/dir/?api=1&origin=${h.latitud},${h.longitud}&destination=-5.192,-80.632&travelmode=walking`;
  }

  private initMap(h: HabitacionResponse) {
    if (typeof window === 'undefined' || typeof L === 'undefined') return;

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const roomLat = h.latitud;
    const roomLng = h.longitud;
    const utpLat = -5.192;
    const utpLng = -80.632;

    if (roomLat === null || roomLat === undefined || roomLng === null || roomLng === undefined) return;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([roomLat, roomLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const uIcon = L.divIcon({
      html: `
        <div class="custom-pin-icon pin-utp">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      className: 'custom-pin-wrapper',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });

    const rIcon = L.divIcon({
      html: `
        <div class="custom-pin-icon pin-room">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      className: 'custom-pin-wrapper',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });

    const utpMarker = L.marker([utpLat, utpLng], { icon: uIcon }).addTo(this.map);
    utpMarker.bindTooltip(`
      <div class="map-tooltip-content tooltip-utp">
        <strong>Universidad Tecnológica del Perú (UTP)</strong>
        <span>${h.distanciaUtpMinutos || 5} min caminando</span>
      </div>
    `, {
      permanent: true,
      direction: 'top',
      offset: [0, -20],
      className: 'map-tooltip'
    }).openTooltip();

    const roomMarker = L.marker([roomLat, roomLng], { icon: rIcon }).addTo(this.map);
    roomMarker.bindTooltip(`
      <div class="map-tooltip-content tooltip-room-single">
        ${h.direccion}
      </div>
    `, {
      permanent: true,
      direction: 'top',
      offset: [0, -20],
      className: 'map-tooltip'
    }).openTooltip();

    const routeCoordinates = [
      [roomLat, roomLng],
      [utpLat, utpLng]
    ];
    const polyline = L.polyline(routeCoordinates as any, {
      color: '#1d4ed8',
      weight: 3,
      dashArray: '6, 8',
      opacity: 0.8
    }).addTo(this.map);

    this.map.fitBounds(polyline.getBounds(), {
      padding: [40, 40]
    });
  }

  toggleFav() {
    if (!this.auth.isAuthenticated()) { this.router.navigate(['/login']); return; }
    this.loadingFav.set(true);
    const isFav = this.esFavorito();
    const obs = isFav
      ? this.favSvc.eliminar(this.id)
      : this.favSvc.agregar(this.id);
    obs.subscribe({
      next: () => {
        this.esFavorito.set(!isFav);
        this.loadingFav.set(false);
        this.toastSvc.success(!isFav ? 'Añadido a favoritos' : 'Eliminado de favoritos');
      },
      error: () => {
        this.loadingFav.set(false);
        this.toastSvc.error('Error al actualizar favoritos');
      }
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
        this.yaCalificada.set(true);
        this.nuevoComentario.set('');
        this.toastSvc.success('Reseña publicada exitosamente');
      },
      error: err => {
        console.error(err);
        this.toastSvc.error(err?.error?.message ?? 'Error al publicar reseña');
      }
    });
  }

  eliminarResena(idResena: number) {
    if (confirm('¿Estás seguro de eliminar tu reseña?')) {
      this.resenaSvc.eliminar(idResena).subscribe({
        next: () => {
          this.resenas.update(arr => arr.filter(r => r.id !== idResena));
          this.yaCalificada.set(false);
          this.resenaOk.set(false);
        }
      });
    }
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
      montoPactado: this.montoPactado(),
      contratoUrl: this.contratoUrlInput()
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

  compartirCopied = signal(false);
  showQr = signal(false);
  isShareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  compartir(plataforma: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'email' | 'copiar' | 'native') {
    const h = this.habitacion();
    if (!h) return;

    const url = window.location.href;
    const text = `¡Mira este alojamiento en EduStay! "${h.titulo}" por S/ ${h.precio} al mes en ${h.direccion}. Más info: `;

    if (plataforma === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + url)}`, '_blank');
    } else if (plataforma === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (plataforma === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (plataforma === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (plataforma === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent('Alojamiento recomendado en EduStay')}&body=${encodeURIComponent(text + '\n' + url)}`, '_blank');
    } else if (plataforma === 'copiar') {
      navigator.clipboard.writeText(url).then(() => {
        this.compartirCopied.set(true);
        setTimeout(() => this.compartirCopied.set(false), 2000);
        this.toastSvc.success('¡Enlace de la habitación copiado al portapapeles!');
      });
    } else if (plataforma === 'native') {
      if (navigator.share) {
        navigator.share({
          title: h.titulo,
          text: text,
          url: url
        }).catch(err => console.log('Error al compartir:', err));
      } else {
        navigator.clipboard.writeText(url).then(() => {
          this.toastSvc.success('¡Enlace copiado al portapapeles!');
        });
      }
    }
  }

  getQrCodeUrl(): string {
    const url = window.location.href;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }
}
