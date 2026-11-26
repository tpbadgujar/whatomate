import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  Layers,
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  X
} from 'lucide-angular';
import { AuthService } from '../core/services/auth.service';
import { CrmService } from '../core/services/crm.service';
import { ThemeService } from '../core/services/theme.service';
import { QuickActionModalComponent } from '../shared/components/quick-action-modal.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LucideAngularModule,
    QuickActionModalComponent
  ],
  styleUrl: './shell.component.scss',
  template: `
    <div class="app-shell" [class.sidebar-collapsed]="sidebarCollapsed()">
      @if (mobileMenuOpen()) {
        <div class="mobile-backdrop" (click)="mobileMenuOpen.set(false)"></div>
      }

      <!-- Left Side Panel -->
      <aside class="sidebar" [class.mobile-open]="mobileMenuOpen()">
        <div class="sidebar-head">
          <a routerLink="/dashboard" class="brand" (click)="mobileMenuOpen.set(false)">
            <span class="brand-glyph">
              <lucide-icon [img]="LayersIcon" [size]="16" [strokeWidth]="1.75" />
            </span>
            @if (!sidebarCollapsed()) {
              <div class="brand-meta">
                <span class="brand-name">Whatomate</span>
                <span class="brand-sub">Super Admin</span>
              </div>
            }
          </a>

          <button
            type="button"
            class="btn btn-ghost btn-icon btn-sm desktop-only"
            [attr.aria-label]="sidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
            (click)="sidebarCollapsed.set(!sidebarCollapsed())"
          >
            <lucide-icon
              [img]="sidebarCollapsed() ? PanelOpenIcon : PanelCloseIcon"
              [size]="16"
              [strokeWidth]="1.5"
            />
          </button>

          <button
            type="button"
            class="btn btn-ghost btn-icon btn-sm mobile-only"
            aria-label="Close navigation"
            (click)="mobileMenuOpen.set(false)"
          >
            <lucide-icon [img]="XIcon" [size]="16" [strokeWidth]="1.5" />
          </button>
        </div>

        <nav class="sidebar-nav" aria-label="Primary navigation">
          <div class="nav-group">
            @if (!sidebarCollapsed()) {
              <div class="nav-group-label">Control Plane</div>
            }
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              class="nav-item"
              (click)="mobileMenuOpen.set(false)"
            >
              <span class="nav-icon">
                <lucide-icon [img]="DashboardIcon" [size]="17" [strokeWidth]="1.5" />
              </span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">Overview</span>
              }
            </a>

            <a
              routerLink="/organizations"
              routerLinkActive="active"
              class="nav-item"
              (click)="mobileMenuOpen.set(false)"
            >
              <span class="nav-icon">
                <lucide-icon [img]="DealsIcon" [size]="17" [strokeWidth]="1.5" />
              </span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">Organizations</span>
              }
            </a>

            <a
              routerLink="/users"
              routerLinkActive="active"
              class="nav-item"
              (click)="mobileMenuOpen.set(false)"
            >
              <span class="nav-icon">
                <lucide-icon [img]="ContactsIcon" [size]="17" [strokeWidth]="1.5" />
              </span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">Users & Super Admins</span>
              }
            </a>

            <a
              routerLink="/audit-logs"
              routerLinkActive="active"
              class="nav-item"
              (click)="mobileMenuOpen.set(false)"
            >
              <span class="nav-icon">
                <lucide-icon [img]="AnalyticsIcon" [size]="17" [strokeWidth]="1.5" />
              </span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">Audit Logs</span>
              }
            </a>
          </div>

          <div class="nav-group">
            @if (!sidebarCollapsed()) {
              <div class="nav-group-label">System</div>
            }
            <a
              routerLink="/settings"
              routerLinkActive="active"
              class="nav-item"
              (click)="mobileMenuOpen.set(false)"
            >
              <span class="nav-icon">
                <lucide-icon [img]="SettingsIcon" [size]="17" [strokeWidth]="1.5" />
              </span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">Settings</span>
              }
            </a>
          </div>
        </nav>

        <div class="sidebar-foot">
          @if (!sidebarCollapsed()) {
            <div class="quota-card">
              <div class="quota-row">
                <span class="quota-title">Q4 Quota</span>
                <span class="mono quota-pct">78%</span>
              </div>
              <div class="quota-track">
                <div class="quota-fill" style="width: 78%"></div>
              </div>
              <div class="quota-meta mono">$896k of $1.15M target</div>
            </div>
          } @else {
            <div class="quota-mini" title="Q4 Quota: 78%">
              <span class="live-dot"></span>
            </div>
          }
        </div>
      </aside>

      <!-- Main Column -->
      <div class="main-column">
        <!-- Top Navigation Bar -->
        <header class="topbar">
          <div class="topbar-left">
            <button
              type="button"
              class="btn btn-ghost btn-icon btn-sm mobile-only"
              aria-label="Open navigation"
              (click)="mobileMenuOpen.set(true)"
            >
              <lucide-icon [img]="MenuIcon" [size]="18" [strokeWidth]="1.5" />
            </button>

            <div class="search-box">
              <lucide-icon [img]="SearchIcon" [size]="15" [strokeWidth]="1.5" class="search-icon" />
              <input
                type="search"
                placeholder="Search deals, contacts"
                [ngModel]="crm.searchQuery()"
                (ngModelChange)="crm.searchQuery.set($event)"
                aria-label="Search workspace"
              />
              <span class="kbd">⌘K</span>
            </div>
          </div>

          <div class="topbar-actions">
            <!-- Quick Action Button -->
            <div class="quick-action-wrap">
              <button
                type="button"
                class="btn btn-accent btn-sm"
                (click)="crm.openQuickAction('deal')"
              >
                <lucide-icon [img]="PlusIcon" [size]="15" [strokeWidth]="2" />
                <span>Quick action</span>
              </button>
            </div>

            <!-- Theme Toggle -->
            <button
              type="button"
              class="btn btn-secondary btn-icon btn-sm"
              aria-label="Toggle color theme"
              (click)="themeService.toggleTheme()"
            >
              <lucide-icon
                [img]="themeService.theme() === 'dark' ? SunIcon : MoonIcon"
                [size]="16"
                [strokeWidth]="1.5"
              />
            </button>

            <!-- Notifications -->
            <div class="popover-anchor">
              <button
                type="button"
                class="btn btn-secondary btn-icon btn-sm"
                aria-label="Notifications"
                (click)="toggleNotifications($event)"
              >
                <lucide-icon [img]="BellIcon" [size]="16" [strokeWidth]="1.5" />
                <span class="notif-dot"></span>
              </button>

              @if (notificationsOpen()) {
                <div class="popover-menu animate-menu" style="width: 320px" (click)="$event.stopPropagation()">
                  <div class="popover-head">
                    <span>Recent activity</span>
                    <span class="mono" style="font-size: 11px; color: var(--text-muted)">
                      {{ crm.activities().length }}
                    </span>
                  </div>
                  <div class="notif-list">
                    @for (item of crm.activities().slice(0, 4); track item.id) {
                      <div class="notif-item">
                        <div class="notif-title">{{ item.title }}</div>
                        <div class="notif-meta">{{ item.detail }} · {{ item.time }}</div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Profile Section in Header -->
            <div class="popover-anchor">
              <button
                type="button"
                class="profile-trigger"
                (click)="toggleProfile($event)"
                [attr.aria-expanded]="profileOpen()"
              >
                <span class="avatar-ring">
                  <span class="avatar-inner">{{ auth.user()?.initials || 'EV' }}</span>
                  <span class="status-dot" [attr.data-status]="auth.user()?.status || 'online'"></span>
                </span>
                <span class="profile-info">
                  <span class="profile-name">{{ auth.user()?.name || 'Elena Vance' }}</span>
                  <span class="profile-role">{{ auth.user()?.role || 'VP of Revenue' }}</span>
                </span>
                <lucide-icon [img]="ChevronDownIcon" [size]="14" [strokeWidth]="1.5" class="profile-chevron" />
              </button>

              @if (profileOpen()) {
                <div class="popover-menu animate-menu" style="width: 264px" (click)="$event.stopPropagation()">
                  <div class="profile-menu-header">
                    <div class="profile-menu-name">{{ auth.user()?.name }}</div>
                    <div class="profile-menu-email">{{ auth.user()?.email }}</div>
                  </div>

                  <div class="menu-section">
                    <div class="menu-label">Accent gradient</div>
                    <div class="accent-row">
                      @for (opt of themeService.accentOptions; track opt.id) {
                        <button
                          type="button"
                          class="accent-chip"
                          [class.active]="themeService.accent() === opt.id"
                          (click)="themeService.setAccent(opt.id)"
                        >
                          <span class="accent-swatch" [style.background]="opt.swatch"></span>
                          <span>{{ opt.label }}</span>
                        </button>
                      }
                    </div>
                  </div>

                  <div class="menu-section">
                    <div class="menu-label">Workspace</div>
                    @for (ws of workspaces; track ws) {
                      <button
                        type="button"
                        class="menu-item"
                        [class.active]="auth.user()?.workspace === ws"
                        (click)="selectWorkspace(ws)"
                      >
                        <lucide-icon [img]="BuildingIcon" [size]="15" [strokeWidth]="1.5" />
                        <span>{{ ws }}</span>
                      </button>
                    }
                  </div>

                  <div class="menu-section">
                    <a routerLink="/settings" class="menu-item" (click)="profileOpen.set(false)">
                      <lucide-icon [img]="SettingsIcon" [size]="15" [strokeWidth]="1.5" />
                      <span>Workspace settings</span>
                    </a>
                    <button type="button" class="menu-item danger" (click)="logout()">
                      <lucide-icon [img]="LogOutIcon" [size]="15" [strokeWidth]="1.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Routed Content -->
        <main class="page-content">
          <div class="content-container">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>

    <app-quick-action-modal />
  `
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly crm = inject(CrmService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly sidebarCollapsed = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly notificationsOpen = signal(false);

  readonly workspaces = ['Meridian Enterprise', 'North America Sales', 'EMEA Expansion'];

  readonly LayersIcon = Layers;
  readonly DashboardIcon = LayoutDashboard;
  readonly AnalyticsIcon = BarChart3;
  readonly DealsIcon = Briefcase;
  readonly ContactsIcon = Users;
  readonly SettingsIcon = Settings;
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly BellIcon = Bell;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly ChevronDownIcon = ChevronDown;
  readonly PanelCloseIcon = PanelLeftClose;
  readonly PanelOpenIcon = PanelLeftOpen;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly LogOutIcon = LogOut;
  readonly BuildingIcon = Building2;

  @HostListener('document:click')
  closeMenus(): void {
    this.profileOpen.set(false);
    this.notificationsOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.crm.openQuickAction('deal');
    }
    if (event.key === 'Escape') {
      this.profileOpen.set(false);
      this.notificationsOpen.set(false);
      this.crm.closeQuickAction();
    }
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationsOpen.set(false);
    this.profileOpen.update((v) => !v);
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen.set(false);
    this.notificationsOpen.update((v) => !v);
  }

  selectWorkspace(ws: string): void {
    this.auth.switchWorkspace(ws);
    this.profileOpen.set(false);
  }

  logout(): void {
    this.profileOpen.set(false);
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
