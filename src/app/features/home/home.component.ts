import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { HabitacionResponse } from '../../core/models/api.models';
import { EDUSTAY_ICONS } from '../../core/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private svc = inject(HabitacionesService);
  destacadas = signal<HabitacionResponse[]>([]);

  ngOnInit() {
    this.svc.getDisponibles().subscribe({
      next: data => this.destacadas.set(data.slice(0, 4))
    });
  }
}
