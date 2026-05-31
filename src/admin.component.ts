import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  stats = {
    usuarios: 1248,
    clientes: 842,
    arrendadores: 406,
    pendientes: 23
  };

  usuarios = [
    {
      nombre: 'María Camila López',
      tipo: 'Cliente',
      fecha: '18 May 2024',
      estado: 'Verificada'
    },
    {
      nombre: 'Juan Rodríguez',
      tipo: 'Arrendador',
      fecha: '18 May 2024',
      estado: 'Pendiente'
    },
    {
      nombre: 'Ana Valentina',
      tipo: 'Cliente',
      fecha: '17 May 2024',
      estado: 'Verificada'
    }
  ];

}