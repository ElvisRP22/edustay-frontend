import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  GoogleSigninButtonDirective,
  SocialAuthService,
  SocialUser
} from '@abacritt/angularx-social-login';
import { AuthService } from './app/core/services/auth.service';
import { environment } from './environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleSigninButtonDirective],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private socialAuth = inject(SocialAuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loginForm: FormGroup;
  showPassword = false;
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  googleLoading = signal(false);
  googleClientConfigured = !!environment.googleClientId;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.socialAuth.authState
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(user => this.handleGoogleSignIn(user));
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const { email, password } = this.loginForm.value;

    this.auth.login({ email, username: email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : '/');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err?.error?.message ?? 'Credenciales inválidas. Intenta nuevamente.'
        );
      }
    });
  }

  private handleGoogleSignIn(user: SocialUser): void {
    const tokenId = user.idToken;

    if (!tokenId) {
      this.errorMsg.set('No se pudo obtener el token de Google.');
      return;
    }

    this.googleLoading.set(true);
    this.errorMsg.set(null);

    this.auth.loginWithGoogle(tokenId).subscribe({
      next: () => {
        this.googleLoading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : '/');
      },
      error: (err) => {
        this.googleLoading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'No se pudo iniciar sesión con Google.');
      }
    });
  }
}