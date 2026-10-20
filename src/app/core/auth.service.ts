import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

const TOKEN_KEY = 'peluqueria_token';
const ADMIN_KEY = 'peluqueria_admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly adminName = signal<string>(this.readAdminName());

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res) => {
        this.write(TOKEN_KEY, res.token);
        this.write(ADMIN_KEY, res.admin.username);
        this.adminName.set(res.admin.username);
      })
    );
  }

  logout(): void {
    this.remove(TOKEN_KEY);
    this.remove(ADMIN_KEY);
    this.adminName.set('');
    this.router.navigate(['/gestion']);
  }

  get token(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  /** Hay token y todavía no venció (se lee el "exp" del JWT; el backend sigue siendo quien valida). */
  isLoggedIn(): boolean {
    const token = this.token;
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp !== 'number' || payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private readAdminName(): string {
    try { return localStorage.getItem(ADMIN_KEY) ?? ''; } catch { return ''; }
  }
  private write(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* sin storage */ } }
  private remove(key: string) { try { localStorage.removeItem(key); } catch { /* sin storage */ } }
}
