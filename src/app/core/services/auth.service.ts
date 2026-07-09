import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, IdentidadVerificadaEstado } from '../models/api.models';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'edustay_token';
const USER_KEY = 'edustay_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/auth`;
  private readonly googleBaseUrl = `${this.baseUrl}/google`;

  // ── Reactive state ────────────────────────────────────────────────────────
  private _user = signal<AuthResponse | null>(this.loadUser());
  private _token = signal<string | null>(this.loadToken());

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly rol = computed(() => this._user()?.rol?.toUpperCase() ?? null);
  readonly isAdmin = computed(() => this.rol() === 'ADMIN');
  readonly isEstudiante = computed(() => this.rol() === 'ESTUDIANTE');
  readonly isArrendador = computed(() => this.rol() === 'ARRENDADOR');
  readonly permisos = computed(() => this._user()?.permisos ?? []);

  hasPermission(permiso: string): boolean {
    return this.permisos().includes(permiso);
  }

  constructor(private http: HttpClient, private router: Router) {}

  // ── Auth endpoints ────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const email = credentials.email?.trim();
    const username = credentials.username?.trim() || email;

    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, {
        email,
        username,
        password: credentials.password
      })
      .pipe(tap(res => this.saveSession(res)));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, data)
      .pipe(tap(res => this.saveSession(res)));
  }

  loginWithGoogle(googleToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.googleBaseUrl, { tokenId: googleToken })
      .pipe(tap(res => this.saveSession(res)));
  }

  validateToken(): Observable<string> {
    return this.http.get(`${this.baseUrl}/validate`, { responseType: 'text' }) as Observable<string>;
  }

  verifyEmail(email: string, codigo: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/verify-email`, { email, codigo })
      .pipe(
        tap(() => {
          const currentUser = this._user();
          if (currentUser && currentUser.email === email) {
            const updated = { ...currentUser, emailVerificado: true };
            this._user.set(updated);
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
          }
        })
      );
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/resend-otp`, { email });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/forgot-password`, { email });
  }

  verifyResetToken(token: string): Observable<{ valid: boolean }> {
    return this.http.get<{ valid: boolean }>(`${this.baseUrl}/reset-password/verify`, {
      params: { token }
    });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, { token, password });
  }

  updateUserVerificationStatus(status: IdentidadVerificadaEstado): void {
    const currentUser = this._user();
    if (currentUser) {
      const updated = { ...currentUser, identidadVerificada: status };
      this._user.set(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }

  updateUserEmailVerificationStatus(status: boolean): void {
    const currentUser = this._user();
    if (currentUser) {
      const updated = { ...currentUser, emailVerificado: status };
      this._user.set(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  // ── Session helpers ───────────────────────────────────────────────────────

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this._token.set(res.token);
    this._user.set(res);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  }
}
