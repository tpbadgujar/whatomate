import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/services/auth.service';
import { ShellComponent } from './layout/shell.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { LoginComponent } from './pages/auth/login.component';
import { AuditLogsComponent } from './pages/platform/audit-logs.component';
import { OrganizationsComponent } from './pages/platform/organizations.component';
import { PlatformOverviewComponent } from './pages/platform/platform-overview.component';
import { PlatformUsersComponent } from './pages/platform/platform-users.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: PlatformOverviewComponent },
      { path: 'organizations', component: OrganizationsComponent },
      { path: 'users', component: PlatformUsersComponent },
      { path: 'audit-logs', component: AuditLogsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
