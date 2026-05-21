import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { EDUSTAY_ICONS } from '../../icons';

type MobileNavItem = {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  primary?: boolean;
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
export class NavbarComponent {
  auth = inject(AuthService);
  menuOpen = signal(false);

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

    if (this.auth.isArrendador()) {
      return [
        ...baseItems,
        { label: 'Mis cuartos', route: '/mis-habitaciones', icon: 'heroBuildingOffice2', primary: true },
        { label: 'Mensajes', route: '/mensajes', icon: 'heroChatBubbleLeftRight' },
        { label: 'Perfil', route: '/perfil', icon: 'heroUserCircle' },
      ];
    }

    return [
      ...baseItems,
      { label: 'Favoritos', route: '/favoritos', icon: 'heroHeart' },
      { label: 'Mensajes', route: '/mensajes', icon: 'heroChatBubbleLeftRight' },
      { label: 'Perfil', route: '/perfil', icon: 'heroUserCircle', primary: true },
    ];
  }

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
