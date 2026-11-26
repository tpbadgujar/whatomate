import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../models/crm.models';
import { PlatformApiService, PlatformUser } from './platform-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly api = inject(PlatformApiService);
  private readonly storageKey = 'whatomate.platform.user';

  readonly user = signal<UserProfile | null>(this.restoreSession());
  readonly segregatedSuperAdmin = signal<boolean>(false);
  readonly isAuthenticated = computed(() => this.user() !== null);

  async loginWithCredentials(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { ok: false, error: 'Enter a valid super admin email address' };
    }
    if (!password) {
      return { ok: false, error: 'Enter your password' };
    }

    try {
      const res = await firstValueFrom(this.api.login(trimmed, password));
      const profile = this.toProfile(res.user);
      this.user.set(profile);
      localStorage.setItem(this.storageKey, JSON.stringify(profile));
      await this.refreshSession();
      return { ok: true };
    } catch (err: any) {
      const msg = err?.error?.message || err?.error?.error || 'Authentication failed';
      return { ok: false, error: msg };
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.api.me());
      const profile = this.toProfile(res.user);
      this.user.set(profile);
      this.segregatedSuperAdmin.set(!!res.segregated_superadmin);
      localStorage.setItem(this.storageKey, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }

  setStatus(status: UserProfile['status']): void {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, status };
    this.user.set(updated);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }

  switchWorkspace(workspace: string): void {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, workspace };
    this.user.set(updated);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }

  logout(): void {
    this.api.logout().subscribe({ error: () => {} });
    this.user.set(null);
    localStorage.removeItem(this.storageKey);
    void this.router.navigate(['/login']);
  }

  private toProfile(u: PlatformUser): UserProfile {
    const name = u.full_name || u.email.split('@')[0] || 'Super Admin';
    const initials =
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n.charAt(0).toUpperCase())
        .join('') || 'SA';

    return {
      id: u.id,
      name,
      email: u.email,
      role: u.is_super_admin ? 'Platform Super Admin' : 'User',
      workspace: 'Whatomate Control Plane',
      initials,
      status: 'online'
    };
  }

  private restoreSession(): UserProfile | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
