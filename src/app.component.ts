import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './index.html',
  styleUrls: ['./styles.scss']
})
export class AppComponent {

  constructor(private router: Router) {}

  irARegistro() {
  console.log("click funcionando");
  this.router.navigate(['/registro']);
}
}