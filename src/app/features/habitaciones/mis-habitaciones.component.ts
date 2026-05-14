import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { AuthService } from '../../core/services/auth.service';
import { HabitacionResponse } from '../../core/models/api.models';
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
  private svc = inject(HabitacionesService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  habitaciones = signal<HabitacionResponse[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);
  saving = signal(false);
  saveOk = signal(false);
  saveError = signal<string | null>(null);
  eliminando = signal<number | null>(null);

  form!: FormGroup;

  ngOnInit() {
    const uid = this.auth.user()?.id;
    if (uid) {
      this.svc.getByArrendador(uid).subscribe({
        next: h => { this.habitaciones.set(h); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
    this.resetForm();
  }

  resetForm(h?: HabitacionResponse) {
    this.form = this.fb.group({
      titulo: [h?.titulo ?? '', [Validators.required, Validators.minLength(1)]],
      descripcion: [h?.descripcion ?? '', [Validators.required, Validators.minLength(1)]],
      precio: [h?.precio ?? '', [Validators.required, Validators.min(1)]],
      direccion: [h?.direccion ?? '', [Validators.required]],
      latitud: [h?.latitud ?? '', [Validators.required]],
      longitud: [h?.longitud ?? '', [Validators.required]]
    });
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

    const obs = this.editId()
      ? this.svc.actualizar(this.editId()!, this.form.value)
      : this.svc.crear(this.form.value);

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
}
