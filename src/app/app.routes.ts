import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './core/services/auth.service';

import { AdminComponent } from './features/admin/dashboard/admin.component';
import { RolesPermisosComponent } from './features/admin/roles-permisos/roles-permisos.component';
import { MisAlquileresComponent } from './features/alquileres/mis-alquileres.component';
import { MisArrendamientosComponent } from './features/alquileres/mis-arrendamientos.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroArrendadorComponent } from './features/auth/registro-arrendador/registro-arrendador.component';
import { RegistroEstudianteComponent } from './features/auth/registro-estudiante/registro-estudiante.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { VerifyEmailComponent } from './features/auth/verify-email/verify-email.component';
import { FavoritosComponent } from './features/favoritos/favoritos.component';
import { HabitacionDetalleComponent } from './features/habitaciones/habitacion-detalle.component';
import { HabitacionesComponent } from './features/habitaciones/habitaciones.component';
import { MisHabitacionesComponent } from './features/habitaciones/mis-habitaciones.component';
import { HomeComponent } from './features/home/home.component';
import { MensajesComponent } from './features/mensajes/mensajes.component';
import { PerfilComponent } from './features/perfil/perfil.component';

export const guestOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;
};

export const authOnlyGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  return auth.validateToken().pipe(
    map(() => true),
    catchError(() => {
      auth.clearSession();
      return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
    })
  );
};

export const adminOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/']);
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'registro', component: RegistroComponent, canActivate: [guestOnlyGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestOnlyGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestOnlyGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [guestOnlyGuard] },
  { path: 'registro/estudiante', component: RegistroEstudianteComponent, canActivate: [guestOnlyGuard] },
  { path: 'registro/arrendador', component: RegistroArrendadorComponent, canActivate: [guestOnlyGuard] },
  { path: 'verify-email', component: VerifyEmailComponent },
  // Habitaciones
  { path: 'habitaciones', component: HabitacionesComponent },
  { path: 'habitaciones/:id', component: HabitacionDetalleComponent },
  // Admin
  { path: 'admin', component: AdminComponent, canActivate: [authOnlyGuard, adminOnlyGuard] },
  { path: 'admin/roles-permisos', component: RolesPermisosComponent, canActivate: [authOnlyGuard, adminOnlyGuard] },
  // Autenticadas
  { path: 'favoritos', component: FavoritosComponent, canActivate: [authOnlyGuard] },
  { path: 'mis-alquileres', component: MisAlquileresComponent, canActivate: [authOnlyGuard] },
  { path: 'mis-arrendamientos', component: MisArrendamientosComponent, canActivate: [authOnlyGuard] },
  { path: 'mis-habitaciones', component: MisHabitacionesComponent, canActivate: [authOnlyGuard] },
  { path: 'mensajes', component: MensajesComponent, canActivate: [authOnlyGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authOnlyGuard] },
  { path: '**', redirectTo: '' }
];
