import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/api.models';
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
  readonly rol = computed(() => this._user()?.rol ?? null);
  readonly isAdmin = computed(() => this._user()?.rol === 'ADMIN');
  readonly isEstudiante = computed(() => this._user()?.rol === 'ESTUDIANTE');
  readonly isArrendador = computed(() => this._user()?.rol === 'ARRENDADOR');

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
    return this.http.get<string>(`${this.baseUrl}/validate`);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
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
