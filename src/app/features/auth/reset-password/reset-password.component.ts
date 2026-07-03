import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  token = '';
  tokenValid = signal<boolean | null>(null); // null = cargando, true = válido, false = inválido
  loading = signal(false);
  success = signal(false);
  errorMessage = signal('');

  showPassword = false;
  showConfirmPassword = false;

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.tokenValid.set(false);
      return;
    }

    this.auth.verifyResetToken(this.token).subscribe({
      next: (res) => {
        this.tokenValid.set(res.valid);
      },
      error: () => {
        this.tokenValid.set(false);
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const p = g.get('password')?.value;
    const cp = g.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const password = this.resetForm.value.password;

    this.auth.resetPassword(this.token, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
        this.toast.success('Contraseña restablecida exitosamente');
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Ocurrió un error al restablecer la contraseña');
        this.toast.error('Error al restablecer contraseña');
      }
    });
  }
}
