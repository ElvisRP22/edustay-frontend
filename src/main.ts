import { bootstrapApplication } from '@angular/platform-browser';
import { CanActivateFn, provideRouter, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import { HomeComponent } from './app/features/home/home.component';
import { RegistroComponent } from './registro.component';
import { LoginComponent } from './login.component';
import { RegistroEstudianteComponent } from './registro-estudiante.component';
import { RegistroArrendadorComponent } from './registro-arrendador.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { HabitacionesComponent } from './app/features/habitaciones/habitaciones.component';
import { HabitacionDetalleComponent } from './app/features/habitaciones/habitacion-detalle.component';
import { FavoritosComponent } from './app/features/favoritos/favoritos.component';
import { MisAlquileresComponent } from './app/features/alquileres/mis-alquileres.component';
import { MisArrendamientosComponent } from './app/features/alquileres/mis-arrendamientos.component';
import { MensajesComponent } from './app/features/mensajes/mensajes.component';
import { PerfilComponent } from './app/features/perfil/perfil.component';
import { MisHabitacionesComponent } from './app/features/habitaciones/mis-habitaciones.component';
import { AuthService } from './app/core/services/auth.service';

const guestOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;
};

const authOnlyGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return auth.isAuthenticated()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'registro', component: RegistroComponent, canActivate: [guestOnlyGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestOnlyGuard] },
  { path: 'registro/estudiante', component: RegistroEstudianteComponent, canActivate: [guestOnlyGuard] },
  { path: 'registro/arrendador', component: RegistroArrendadorComponent, canActivate: [guestOnlyGuard] },
  // Habitaciones
  { path: 'habitaciones', component: HabitacionesComponent },
  { path: 'habitaciones/:id', component: HabitacionDetalleComponent },
  // Autenticadas
  { path: 'favoritos', component: FavoritosComponent, canActivate: [authOnlyGuard] },
  { path: 'mis-alquileres', component: MisAlquileresComponent, canActivate: [authOnlyGuard] },
  { path: 'mis-arrendamientos', component: MisArrendamientosComponent, canActivate: [authOnlyGuard] },
  { path: 'mis-habitaciones', component: MisHabitacionesComponent, canActivate: [authOnlyGuard] },
  { path: 'mensajes', component: MensajesComponent, canActivate: [authOnlyGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authOnlyGuard] },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    ...appConfig.providers
  ]
});
