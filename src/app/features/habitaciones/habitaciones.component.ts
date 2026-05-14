import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { HabitacionResponse } from '../../core/models/api.models';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitacionesComponent implements OnInit {
  private svc = inject(HabitacionesService);

  habitaciones = signal<HabitacionResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtros locales
  query = signal('');
  maxPrecio = signal<number | null>(null);
  soloDisponibles = signal(true);

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.habitaciones().filter(h => {
      const matchQ = !q || h.titulo.toLowerCase().includes(q) || h.direccion.toLowerCase().includes(q);
      const matchP = !this.maxPrecio() || h.precio <= this.maxPrecio()!;
      const matchD = !this.soloDisponibles() || h.estado === 'DISPONIBLE';
      return matchQ && matchP && matchD;
    });
  });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => { this.habitaciones.set(data); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar las habitaciones.'); this.loading.set(false); }
    });
  }

  setMaxPrecio(v: string) {
    this.maxPrecio.set(v ? Number(v) : null);
  }
}
