import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { EDUSTAY_ICONS } from '../../../core/icons';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIcon],
  providers: [provideIcons(EDUSTAY_ICONS)],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyEmailComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  @ViewChild('codigoInput') codigoInputRef!: ElementRef<HTMLInputElement>;

  verifyForm: FormGroup;
  email = signal<string>('');
  loading = signal(false);
  resending = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  codigoValue = signal('');
  isFocused = signal(false);

  constructor() {
    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnInit() {
    // Intentar leer el email del query param
    this.route.queryParams.subscribe(params => {
      const emailParam = params['email'];
      if (emailParam) {
        this.email.set(emailParam);
      } else {
        // Fallback al usuario logueado actualmente
        const currentUser = this.auth.user();
        if (currentUser) {
          this.email.set(currentUser.email);
        } else {
          // Si no hay email, redirigir a login
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngAfterViewInit() {
    // Autofocus al cargar la pantalla
    setTimeout(() => {
      this.focusInput();
    }, 400);
  }

  focusInput() {
    if (this.codigoInputRef) {
      this.codigoInputRef.nativeElement.focus();
    }
  }

  onOtpInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Solo permitir números
    const cleanValue = input.value.replace(/[^0-9]/g, '');
    input.value = cleanValue;
    this.codigoValue.set(cleanValue);
    this.verifyForm.get('codigo')?.setValue(cleanValue, { emitEvent: false });
  }

  onSubmit() {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const code = this.verifyForm.value.codigo;

    this.auth.verifyEmail(this.email(), code).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('¡Tu correo electrónico ha sido verificado con éxito! Redirigiendo...');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'El código ingresado es incorrecto o ha expirado.';
        this.errorMsg.set(msg);
        if (msg.includes('ya se encuentra verificado')) {
          this.auth.updateUserEmailVerificationStatus(true);
          this.successMsg.set('Tu cuenta ya está verificada. Redirigiendo...');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
      }
    });
  }

  onResendOtp() {
    this.resending.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    this.auth.resendOtp(this.email()).subscribe({
      next: (res) => {
        this.resending.set(false);
        this.successMsg.set(res?.message ?? 'Se ha enviado un nuevo código de verificación a tu correo.');
        // Limpiar el input y hacer foco de nuevo
        this.codigoValue.set('');
        if (this.codigoInputRef) {
          this.codigoInputRef.nativeElement.value = '';
          this.focusInput();
        }
      },
      error: (err) => {
        this.resending.set(false);
        const msg = err?.error?.message ?? 'No se pudo reenviar el código. Inténtalo más tarde.';
        this.errorMsg.set(msg);
        if (msg.includes('ya se encuentra verificado')) {
          this.auth.updateUserEmailVerificationStatus(true);
          this.successMsg.set('Tu cuenta ya está verificada. Redirigiendo...');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
      }
    });
  }
}
