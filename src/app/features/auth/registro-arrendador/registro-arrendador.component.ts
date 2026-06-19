import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro-arrendador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro-arrendador.html',
  styleUrl: './registro-arrendador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroArrendadorComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  registroForm: FormGroup;
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  constructor() {
    this.registroForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        terminos: [false, Validators.requiredTrue]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const { nombre, apellido, email, password, confirmPassword, telefono } =
      this.registroForm.value;

    this.auth
      .register({ nombre, apellido, email, password, confirmPassword, telefono, rol: 'ARRENDADOR' })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/verify-email'], { queryParams: { email } });
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(
            err?.error?.message ?? 'Error al registrarse. Intenta nuevamente.'
          );
        }
      });
  }
}
