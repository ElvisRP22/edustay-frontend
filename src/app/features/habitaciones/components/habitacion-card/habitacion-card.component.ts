import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { EDUSTAY_ICONS } from '../../../../core/icons';
import { HabitacionCatalogItem, HabitacionResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-habitacion-card',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './habitacion-card.component.html',
  styleUrl: './habitacion-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitacionCardComponent {
  @Input({ required: true }) habitacion!: HabitacionResponse;
  @Output() share = new EventEmitter<Event>();

  onShareClick(event: Event) {
    this.share.emit(event);
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
