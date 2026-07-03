import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = signal(false);
  success = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const email = this.forgotForm.value.email;
    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
        this.successMessage.set(res.message);
        this.toast.success('Solicitud procesada con éxito');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Ocurrió un error al procesar tu solicitud');
        this.toast.error('Error al procesar la solicitud');
      }
    });
  }
}
