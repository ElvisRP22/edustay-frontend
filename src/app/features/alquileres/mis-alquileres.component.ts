import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlquileresService } from '../../core/services/alquileres.service';
import { AlquilerResponse } from '../../core/models/api.models';

@Component({
  selector: 'app-mis-alquileres',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-alquileres.component.html',
  styleUrl: './mis-alquileres.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisAlquileresComponent implements OnInit {
  private svc = inject(AlquileresService);
  alquileres = signal<AlquilerResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.svc.getMisAlquileres().subscribe({
      next: data => { this.alquileres.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
