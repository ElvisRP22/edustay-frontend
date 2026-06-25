import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { AuthService } from '../../core/services/auth.service';
import { HabitacionCatalogItem, HabitacionRequest, HabitacionResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';

@Component({
  selector: 'app-mis-habitaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './mis-habitaciones.component.html',
  styleUrl: './mis-habitaciones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisHabitacionesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private svc = inject(HabitacionesService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

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
    this.form = this.fb.group({
      titulo: [h?.titulo ?? '', [Validators.required, Validators.minLength(1)]],
      descripcion: [h?.descripcion ?? '', [Validators.required, Validators.minLength(1)]],
      fotoUrl: [h?.fotos && h.fotos.length > 0 ? h.fotos[0] : ''],
      precio: [h?.precio ?? '', [Validators.required, Validators.min(1)]],
      direccion: [h?.direccion ?? '', [Validators.required]],
      latitud: [h?.latitud ?? '', [Validators.required]],
      longitud: [h?.longitud ?? '', [Validators.required]]
    });

    this.selectedServiceIds.set(h?.servicios?.map(s => s.id) ?? []);
    this.selectedReglaIds.set(h?.reglas?.map(r => r.id) ?? []);
  }

  abrirNueva() {
    this.editId.set(null);
    this.resetForm();
    this.saveOk.set(false);
    this.saveError.set(null);
    this.showForm.set(true);
  }

  abrirEditar(h: HabitacionResponse) {
    this.editId.set(h.id);
    this.resetForm(h);
    this.saveOk.set(false);
    this.saveError.set(null);
    this.showForm.set(true);
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveError.set(null);

    const { fotoUrl, ...rest } = this.form.getRawValue();
    const payload: HabitacionRequest = {
      ...rest,
      servicioIds: this.selectedServiceIds(),
      reglaIds: this.selectedReglaIds(),
      fotos: fotoUrl ? [fotoUrl] : []
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
