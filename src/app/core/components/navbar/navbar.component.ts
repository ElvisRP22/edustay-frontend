import { ChangeDetectionStrategy, Component, HostListener, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MensajesService } from '../../services/mensajes.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { EDUSTAY_ICONS } from '../../icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type MobileNavItem = {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  primary?: boolean;
  badge?: number;
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  private mensajesSvc = inject(MensajesService);
  private destroyRef = inject(DestroyRef);
  
  menuOpen = signal(false);
  noLeidos = signal(0);

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.mensajesSvc.getNoLeidos()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(obj => {
          // Si el backend devuelve { "count": 3 } o { "total": 3 } o algo así
          const total = Object.values(obj).reduce((sum, val) => sum + val, 0);
          this.noLeidos.set(total);
        });
    }
  }

  @HostListener('document:keydown.escape')
  closeMenu() { this.menuOpen.set(false); }

  toggleMenu() { this.menuOpen.update(v => !v); }

  mobileNavItems(): MobileNavItem[] {
    const baseItems: MobileNavItem[] = [
      { label: 'Inicio', route: '/', icon: 'heroHome', exact: true },
      { label: 'Buscar', route: '/habitaciones', icon: 'heroMapPin' },
    ];

    if (!this.auth.isAuthenticated()) {
      return [
        ...baseItems,
        { label: 'Entrar', route: '/login', icon: 'heroUserCircle' },
        { label: 'Unirse', route: '/registro', icon: 'heroPlusCircle', primary: true },
      ];
    }

    const badgeCount = this.noLeidos();

    if (this.auth.isAdmin()) {
      return [
        ...baseItems,
        { label: 'Admin', route: '/admin', icon: 'heroCog', primary: true },
      ];
    }

    if (this.auth.isArrendador()) {
      return [
        ...baseItems,
        { label: 'Mis cuartos', route: '/mis-habitaciones', icon: 'heroBuildingOffice2', primary: true },
        { label: 'Mensajes', route: '/mensajes', icon: 'heroChatBubbleLeftRight', badge: badgeCount },
        { label: 'Perfil', route: '/perfil', icon: 'heroUserCircle' },
      ];
    }

    return [
      ...baseItems,
      { label: 'Favoritos', route: '/favoritos', icon: 'heroHeart' },
      { label: 'Mensajes', route: '/mensajes', icon: 'heroChatBubbleLeftRight', badge: badgeCount },
      { label: 'Perfil', route: '/perfil', icon: 'heroUserCircle', primary: true },
    ];
  }

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
