import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from 'environments';
import { loginRequest } from '../interfaces';
import { AppRole } from '@core/guards';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED';

export interface JwtPayload {
  sub: string;
  role: AppRole;
  tenantId: string;
  tenantStatus: TenantStatus;
  sessionId?: string;
  firstName?: string;
  lastName?: string;
  exp: number;
}

// Flujo passwordless: login solicita magic link → /verification o /accept-invitation
// intercambia el token por access_token + refresh_token y los guarda en localStorage
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly ACCESS_TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Inicializado verificando expiración del JWT al arrancar la app
  isAuthenticated = signal<boolean>(this.hasValidToken());

  login(payload: loginRequest) {
    return this.http.post<{ message: string }>(`${environment.baseUrl}/auth/login`, payload);
  }

  register(payload: { firstName: string; lastName: string; companyName: string; email: string }) {
    return this.http.post<{ message: string }>(`${environment.baseUrl}/auth/register`, payload);
  }

  verifyAccount(token: string) {

    return this.http.post<AuthResponse>(`${environment.baseUrl}/auth/verification`, { token }).pipe(
      tap(({ access_token, refresh_token }) => this.saveTokens(access_token, refresh_token))
    );
  }

  acceptInvitation(token: string) {
    return this.http.post<AuthResponse>(`${environment.baseUrl}/auth/accept-invitation`, { token }).pipe(
      tap(({ access_token, refresh_token }) => this.saveTokens(access_token, refresh_token))
    );
  }

  refreshToken() {
    return this.http.get<AuthResponse>(`${environment.baseUrl}/auth/refresh-token`, {
      headers: { 'refresh-token': this.getRefreshToken() ?? '' }
    }).pipe(
      tap(({ access_token, refresh_token }) => this.saveTokens(access_token, refresh_token))
    );
  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.router.navigateByUrl('/auth/login');
  }

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  }

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.isAuthenticated.set(true);
  }

  private hasValidToken(): boolean {
    const payload = this.getPayload();
    return !!payload && payload.exp * 1000 > Date.now();
  }
}
