import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/services';
import { environment } from 'environments';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  sidebarOpen = signal(true);
  protected readonly environment = environment;
  protected readonly userName = (() => {
    const p = this.authService.getPayload();
    return [p?.firstName, p?.lastName].filter(Boolean).join(' ');
  })();

  navGroups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Users', icon: 'users', route: '/users' },
        { label: 'Locations', icon: 'locations', route: '/locations' },
        { label: 'Authorities', icon: 'authorities', route: '/authorities' },
      ],
    },
    {
      title: 'Compliance',
      items: [
        { label: 'Compliances', icon: 'compliances', route: '/compliances' },
        { label: 'Reports', icon: 'reports', route: '/reports' },
      ],
    },
  ];

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
