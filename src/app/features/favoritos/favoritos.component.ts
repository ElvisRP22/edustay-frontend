import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FavoritosService } from '../../core/services/favoritos.service';
import { HabitacionResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritosComponent implements OnInit {
  private svc = inject(FavoritosService);
  favoritos = signal<HabitacionResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.svc.getMisFavoritos().subscribe({
      next: data => { this.favoritos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  quitar(id: number) {
    this.svc.eliminar(id).subscribe({
      next: () => this.favoritos.update(arr => arr.filter(h => h.id !== id))
    });
  }
}
