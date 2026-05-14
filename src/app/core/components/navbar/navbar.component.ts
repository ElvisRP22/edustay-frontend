import { ChangeDetectionStrategy, Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
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

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
