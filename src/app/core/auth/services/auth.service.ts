import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from 'environments';

import { AppRole } from '@core/guards';
import { loginRequest } from '@shared/interfaces';

export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED';

// Informacion del usuario almacenada en localStorage (no contiene tokens).
// Los tokens viajan en cookies HttpOnly — JavaScript no puede leerlos.
export interface UserInfo {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  tenantId: string;
  tenantStatus: TenantStatus;
}

// Alias mantenido para compatibilidad con componentes que leen el payload via getPayload()
export type JwtPayload = UserInfo;

// Flujo passwordless: login solicita magic link → /verification o /accept-invitation
// El backend establece cookies HttpOnly con los tokens; la respuesta solo trae info del usuario.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly USER_INFO_KEY = 'user_info';

  isAuthenticated = signal<boolean>(this.hasStoredUser());

  login(payload: loginRequest) {
    return this.http.post<{ message: string }>(`${environment.baseUrl}/auth/login`, payload, {
      withCredentials: true
    });
  }

  register(payload: { firstName: string; lastName: string; companyName: string; email: string }) {
    return this.http.post<{ message: string }>(`${environment.baseUrl}/auth/register`, payload, {
      withCredentials: true
    });
  }

  verifyAccount(token: string) {
    return this.http.post<UserInfo>(`${environment.baseUrl}/auth/verification`, { token }, {
      withCredentials: true
    }).pipe(
      tap((userInfo) => this.saveUserInfo(userInfo))
    );
  }

  acceptInvitation(token: string) {
    return this.http.post<UserInfo>(`${environment.baseUrl}/auth/accept-invitation`, { token }, {
      withCredentials: true
    }).pipe(
      tap((userInfo) => this.saveUserInfo(userInfo))
    );
  }

  // El refresh token viaja automaticamente en la cookie — no se necesita header manual
  refreshToken() {
    return this.http.get<UserInfo>(`${environment.baseUrl}/auth/refresh-token`, {
      withCredentials: true
    }).pipe(
      tap((userInfo) => this.saveUserInfo(userInfo))
    );
  }

  logout() {
    // Se limpia el estado local ANTES del HTTP call para que si el interceptor recibe
    // un 401 en esta peticion, vea isAuthenticated=false y no intente un refresh (evita loops).
    this.clearUserInfo();
    this.http.delete(`${environment.baseUrl}/auth/logout`, { withCredentials: true }).subscribe({
      complete: () => { this.router.navigateByUrl('/auth/login'); },
      error: () => { this.router.navigateByUrl('/auth/login'); }
    });
  }

  getPayload(): UserInfo | null {
    const raw = localStorage.getItem(this.USER_INFO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      return null;
    }
  }

  saveUserInfo(userInfo: UserInfo) {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    this.isAuthenticated.set(true);
  }

  private clearUserInfo() {
    localStorage.removeItem(this.USER_INFO_KEY);
    this.isAuthenticated.set(false);
  }

  private hasStoredUser(): boolean {
    // Verifica que el user_info exista Y sea JSON valido — un valor corrupto
    // devolveria true en getItem pero null en getPayload, creando estado inconsistente
    return !!this.getPayload();
  }
}
