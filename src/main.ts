import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './app/features/home/home.component';
import { RegistroComponent } from './registro.component';
import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'registro', component: RegistroComponent },
  {path: 'login', component: LoginComponent}
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});