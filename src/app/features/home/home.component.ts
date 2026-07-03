import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { HabitacionCatalogItem, HabitacionResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private svc = inject(HabitacionesService);
  private router = inject(Router);
  auth = inject(AuthService);
  destacadas = signal<HabitacionResponse[]>([]);
  searchQuery = signal('');
  searchBudget = signal('');

  ngOnInit() {
    this.svc.getDisponibles().subscribe({
      next: data => this.destacadas.set(data.slice(0, 4))
    });
  }

  buscar() {
    const query = this.searchQuery().trim();
    const maxPrecio = this.searchBudget();

    void this.router.navigate(['/habitaciones'], {
      queryParams: {
        ...(query ? { query } : {}),
        ...(maxPrecio ? { maxPrecio } : {}),
        soloDisponibles: true
      }
    });
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
}
