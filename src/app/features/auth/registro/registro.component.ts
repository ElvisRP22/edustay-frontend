import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-registro',
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class RegistroComponent {}