import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, OnDestroy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { AuthService } from '../../core/services/auth.service';
import { HabitacionCatalogItem, HabitacionRequest, HabitacionResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';

declare const L: any;

@Component({
  selector: 'app-mis-habitaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './mis-habitaciones.component.html',
  styleUrl: './mis-habitaciones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisHabitacionesComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private svc = inject(HabitacionesService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  private map: any;
  private marker: any;

  habitaciones = signal<HabitacionResponse[]>([]);
  serviciosCatalogo = signal<HabitacionCatalogItem[]>([]);
  reglasCatalogo = signal<HabitacionCatalogItem[]>([]);
  loading = signal(true);
  loadingCatalogos = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);
  saving = signal(false);
  saveOk = signal(false);
  saveError = signal<string | null>(null);
  eliminando = signal<number | null>(null);

  form!: FormGroup;
  selectedServiceIds = signal<number[]>([]);
  selectedReglaIds = signal<number[]>([]);

  ngOnInit() {
    const uid = this.auth.user()?.id;
    if (uid) {
      this.svc.getByArrendador(uid).subscribe({
        next: h => { this.habitaciones.set(h); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }

    this.loadCatalogos();
    this.resetForm();
  }

  resetForm(h?: HabitacionResponse) {
    const fotosControls = h?.fotos ? h.fotos.map(url => this.fb.control(url, [Validators.required])) : [];

    this.form = this.fb.group({
      titulo: [h?.titulo ?? '', [Validators.required, Validators.minLength(1)]],
      descripcion: [h?.descripcion ?? '', [Validators.required, Validators.minLength(1)]],
      precio: [h?.precio ?? '', [Validators.required, Validators.min(1)]],
      direccion: [h?.direccion ?? '', [Validators.required]],
      latitud: [h?.latitud ?? '', [Validators.required]],
      longitud: [h?.longitud ?? '', [Validators.required]],
      fotos: this.fb.array(fotosControls)
    });

    this.selectedServiceIds.set(h?.servicios?.map(s => s.id) ?? []);
    this.selectedReglaIds.set(h?.reglas?.map(r => r.id) ?? []);

    if (this.fotosFormArray.length === 0) {
      this.addFotoUrl();
    }
  }

  get fotosFormArray() {
    return this.form.get('fotos') as FormArray;
  }

  addFotoUrl(url = '') {
    this.fotosFormArray.push(this.fb.control(url, [Validators.required]));
  }

  removeFotoUrl(index: number) {
    this.fotosFormArray.removeAt(index);
    if (this.fotosFormArray.length === 0) {
      this.addFotoUrl();
    }
  }

  abrirNueva() {
    this.editId.set(null);
    this.resetForm();
    this.saveOk.set(false);
    this.saveError.set(null);
    this.showForm.set(true);
    setTimeout(() => this.initFormMap(), 100);
  }

  abrirEditar(h: HabitacionResponse) {
    this.editId.set(h.id);
    this.resetForm(h);
    this.saveOk.set(false);
    this.saveError.set(null);
    this.showForm.set(true);
    setTimeout(() => this.initFormMap(h.latitud, h.longitud), 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initFormMap(lat?: number, lng?: number, retries = 0) {
    if (typeof window === 'undefined') return;

    if (typeof L === 'undefined') {
      if (retries < 15) {
        setTimeout(() => this.initFormMap(lat, lng, retries + 1), 100);
      }
      return;
    }

    const mapElement = document.getElementById('formMap');
    if (!mapElement) {
      if (retries < 15) {
        setTimeout(() => this.initFormMap(lat, lng, retries + 1), 100);
      }
      return;
    }

    // Default to UTP Piura if no coordinates provided
    const initialLat = (lat !== undefined && lat !== null && lat !== 0) ? lat : -5.1966;
    const initialLng = (lng !== undefined && lng !== null && lng !== 0) ? lng : -80.6277;

    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }

    this.map = L.map('formMap', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([initialLat, initialLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

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

    this.marker = L.marker([initialLat, initialLng], {
      icon: rIcon,
      draggable: true
    }).addTo(this.map);

    // If coordinates were not preset, patch them so the form starts with these defaults
    if (lat === undefined || lat === null || lat === 0) {
      this.form.patchValue({ latitud: initialLat, longitud: initialLng });
    }

    // Drag marker event
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.form.patchValue({
        latitud: Number(position.lat.toFixed(6)),
        longitud: Number(position.lng.toFixed(6))
      });
    });

    // Map click event to relocate marker
    this.map.on('click', (e: any) => {
      const position = e.latlng;
      this.marker.setLatLng(position);
      this.form.patchValue({
        latitud: Number(position.lat.toFixed(6)),
        longitud: Number(position.lng.toFixed(6))
      });
    });

    // Invalidate size shortly after load to ensure Leaflet renders all tiles correctly
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 150);
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveError.set(null);

    const raw = this.form.getRawValue();
    const payload: HabitacionRequest = {
      titulo: raw.titulo,
      descripcion: raw.descripcion,
      precio: raw.precio,
      direccion: raw.direccion,
      latitud: raw.latitud,
      longitud: raw.longitud,
      servicioIds: this.selectedServiceIds(),
      reglaIds: this.selectedReglaIds(),
      fotos: raw.fotos ? raw.fotos.filter((url: string) => url && url.trim() !== '') : []
    };

    const obs = this.editId()
      ? this.svc.actualizar(this.editId()!, payload)
      : this.svc.crear(payload);

    obs.subscribe({
      next: h => {
        if (this.editId()) {
          this.habitaciones.update(arr => arr.map(x => x.id === h.id ? h : x));
        } else {
          this.habitaciones.update(arr => [h, ...arr]);
        }
        this.saving.set(false);
        this.saveOk.set(true);
        this.showForm.set(false);
      },
      error: err => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message ?? 'Error al guardar.');
      }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar esta habitación?')) return;
    this.eliminando.set(id);
    this.svc.eliminar(id).subscribe({
      next: () => { this.habitaciones.update(arr => arr.filter(h => h.id !== id)); this.eliminando.set(null); },
      error: () => this.eliminando.set(null)
    });
  }

  toggleServicio(id: number): void {
    this.selectedServiceIds.update(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
  }

  toggleRegla(id: number): void {
    this.selectedReglaIds.update(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
  }

  isServicioSelected(id: number): boolean {
    return this.selectedServiceIds().includes(id);
  }

  isReglaSelected(id: number): boolean {
    return this.selectedReglaIds().includes(id);
  }

  private loadCatalogos(): void {
    this.loadingCatalogos.set(true);

    forkJoin({
      servicios: this.svc.getServiciosCatalogo(),
      reglas: this.svc.getReglasCatalogo()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.serviciosCatalogo.set(result.servicios);
          this.reglasCatalogo.set(result.reglas);
          this.loadingCatalogos.set(false);
        },
        error: () => this.loadingCatalogos.set(false)
      });
  }
}
