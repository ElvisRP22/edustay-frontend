import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlquileresService } from '../../core/services/alquileres.service';
import { AlquilerResponse } from '../../core/models/api.models';

@Component({
  selector: 'app-mis-arrendamientos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-arrendamientos.component.html',
  styleUrl: './mis-arrendamientos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisArrendamientosComponent implements OnInit {
  private svc = inject(AlquileresService);
  arrendamientos = signal<AlquilerResponse[]>([]);
  loading = signal(true);
  finalizando = signal<number | null>(null);

  ngOnInit() {
    this.svc.getMisArrendamientos().subscribe({
      next: data => { this.arrendamientos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  finalizar(id: number) {
    if (!confirm('¿Confirmas que deseas finalizar este alquiler?')) return;
    this.finalizando.set(id);
    this.svc.finalizar(id).subscribe({
      next: () => {
        this.arrendamientos.update(arr => arr.filter(a => a.id !== id));
        this.finalizando.set(null);
      },
      error: () => this.finalizando.set(null)
    });
  }
}
