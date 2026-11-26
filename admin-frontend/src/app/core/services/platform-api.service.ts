import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ApiEnvelope<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  full_name: string;
  organization_id: string;
  organization_name?: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at?: string;
}

export interface PlatformOverview {
  total_organizations: number;
  total_users: number;
  active_users: number;
  super_admins: number;
  total_accounts: number;
  total_contacts: number;
  segregated_superadmin: boolean;
}

export interface PlatformOrganization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  user_count: number;
  account_count: number;
}

export interface PlatformAuditLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  ip_address?: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/platform';

  login(email: string, password: string): Observable<{ expires_in: number; user: PlatformUser }> {
    return this.http
      .post<ApiEnvelope<{ expires_in: number; user: PlatformUser }>>(
        `${this.base}/auth/login`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }

  logout(): Observable<{ status: string }> {
    return this.http
      .post<ApiEnvelope<{ status: string }>>(`${this.base}/auth/logout`, {}, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  me(): Observable<{ user: PlatformUser; segregated_superadmin: boolean }> {
    return this.http
      .get<ApiEnvelope<{ user: PlatformUser; segregated_superadmin: boolean }>>(
        `${this.base}/auth/me`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }

  getOverview(): Observable<PlatformOverview> {
    return this.http
      .get<ApiEnvelope<PlatformOverview>>(`${this.base}/overview`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  listOrganizations(): Observable<PlatformOrganization[]> {
    return this.http
      .get<ApiEnvelope<{ organizations: PlatformOrganization[] }>>(`${this.base}/organizations`, {
        withCredentials: true
      })
      .pipe(map((res) => res.data.organizations ?? []));
  }

  createOrganization(name: string, slug?: string): Observable<PlatformOrganization> {
    return this.http
      .post<ApiEnvelope<{ organization: PlatformOrganization }>>(
        `${this.base}/organizations`,
        { name, slug },
        { withCredentials: true }
      )
      .pipe(map((res) => res.data.organization));
  }

  updateOrganization(id: string, name: string, slug?: string): Observable<PlatformOrganization> {
    return this.http
      .put<ApiEnvelope<{ organization: PlatformOrganization }>>(
        `${this.base}/organizations/${id}`,
        { name, slug },
        { withCredentials: true }
      )
      .pipe(map((res) => res.data.organization));
  }

  listUsers(): Observable<PlatformUser[]> {
    return this.http
      .get<ApiEnvelope<{ users: PlatformUser[] }>>(`${this.base}/users`, { withCredentials: true })
      .pipe(map((res) => res.data.users ?? []));
  }

  updateUser(
    id: string,
    payload: { is_super_admin?: boolean; is_active?: boolean }
  ): Observable<PlatformUser> {
    return this.http
      .put<ApiEnvelope<{ user: PlatformUser }>>(`${this.base}/users/${id}`, payload, {
        withCredentials: true
      })
      .pipe(map((res) => res.data.user));
  }

  listAuditLogs(limit = 50): Observable<PlatformAuditLog[]> {
    return this.http
      .get<ApiEnvelope<{ audit_logs: PlatformAuditLog[] }>>(`${this.base}/audit-logs?limit=${limit}`, {
        withCredentials: true
      })
      .pipe(map((res) => res.data.audit_logs ?? []));
  }

  setSegregatedSuperAdmin(enabled: boolean): Observable<{ segregated_superadmin: boolean }> {
    return this.http
      .put<ApiEnvelope<{ segregated_superadmin: boolean }>>(
        `${this.base}/features/segregated-superadmin`,
        { enabled },
        { withCredentials: true }
      )
      .pipe(map((res) => res.data));
  }
}
