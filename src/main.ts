import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro/estudiante', component: RegistroEstudianteComponent },
  { path: 'registro/arrendador', component: RegistroArrendadorComponent },
  // Habitaciones
  { path: 'habitaciones', component: HabitacionesComponent },
  { path: 'habitaciones/:id', component: HabitacionDetalleComponent },
  // Autenticadas
  { path: 'favoritos', component: FavoritosComponent },
  { path: 'mis-alquileres', component: MisAlquileresComponent },
  { path: 'mis-arrendamientos', component: MisArrendamientosComponent },
  { path: 'mis-habitaciones', component: MisHabitacionesComponent },
  { path: 'mensajes', component: MensajesComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
});
