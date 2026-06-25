import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { ToastService } from '../../core/services/toast.service';
import { HabitacionCatalogItem, HabitacionResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';
import { HabitacionCardComponent } from './components/habitacion-card/habitacion-card.component';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, HabitacionCardComponent],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitacionesComponent implements OnInit {
  private svc = inject(HabitacionesService);
  private toastSvc = inject(ToastService);

  habitaciones = signal<HabitacionResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtros reactivos
  query = signal('');
  maxPrecio = signal<number | null>(null);
  soloDisponibles = signal(true);

  // Geolocalización
  cercaDeMi = signal(false);
  latitud = signal<number | null>(null);
  longitud = signal<number | null>(null);
  radioKm = signal<number>(5);

  filtered = computed(() => this.habitaciones());

  constructor() {
    // Escuchar cambios en los filtros y volver a cargar los datos reactivamente
    effect(() => {
      // Registramos las dependencias de los signals
      const q = this.query();
      const p = this.maxPrecio();
      const d = this.soloDisponibles();
      const c = this.cercaDeMi();
      const lat = this.latitud();
      const lon = this.longitud();
      const rad = this.radioKm();

      // Disparamos la recarga
      this.loadHabitaciones();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // La carga inicial se maneja automáticamente por el effect
  }

  loadHabitaciones() {
    this.loading.set(true);
    this.error.set(null);

    const params: any = {
      query: this.query(),
      maxPrecio: this.maxPrecio(),
      soloDisponibles: this.soloDisponibles()
    };

    if (this.cercaDeMi() && this.latitud() && this.longitud()) {
      params.lat = this.latitud();
      params.lon = this.longitud();
      params.radioKm = this.radioKm();
    }

    this.svc.buscarConFiltros(params).subscribe({
      next: data => {
        this.habitaciones.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar las habitaciones.');
        this.loading.set(false);
      }
    });
  }

  toggleCercaDeMi() {
    if (!this.cercaDeMi()) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitud.set(position.coords.latitude);
            this.longitud.set(position.coords.longitude);
            this.cercaDeMi.set(true);
          },
          (err) => {
            alert('No se pudo obtener tu ubicación. Por favor, asegúrate de activar los permisos de ubicación en tu navegador.');
          }
        );
      } else {
        alert('Geolocalización no soportada por tu navegador.');
      }
    } else {
      this.cercaDeMi.set(false);
      this.latitud.set(null);
      this.longitud.set(null);
    }
  }

  setRadio(r: string) {
    this.radioKm.set(Number(r));
  }

  setMaxPrecio(v: string) {
    this.maxPrecio.set(v ? Number(v) : null);
  }

  visibleCatalogos(items?: HabitacionCatalogItem[], limit = 2): HabitacionCatalogItem[] {
    return (items ?? []).slice(0, limit);
  }

  hiddenCatalogosCount(items?: HabitacionCatalogItem[], limit = 2): number {
    return Math.max((items ?? []).length - limit, 0);
  }

  catalogoLabel(item: HabitacionCatalogItem, fallbackPrefix: string, index: number): string {
    return item.nombre?.trim() || item.descripcion?.trim() || `${fallbackPrefix} ${index + 1}`;
  }

  quickShare(event: Event, h: HabitacionResponse) {
    event.stopPropagation();
    event.preventDefault();

    const url = `${window.location.origin}/habitaciones/${h.id}`;
    const text = `¡Mira este alojamiento en EduStay! "${h.titulo}" por S/ ${h.precio} al mes. Más info: `;

    if (navigator.share) {
      navigator.share({
        title: h.titulo,
        text: text,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.toastSvc.success(`¡Enlace de "${h.titulo}" copiado al portapapeles!`);
      });
    }
  }
}
