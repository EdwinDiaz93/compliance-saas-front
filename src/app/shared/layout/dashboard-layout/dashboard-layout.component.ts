import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/services';
import { BillingService } from '@features/billing/services/billing.service';
import { NotificationService } from '@shared/services/notification.service';
import { environment } from 'environments';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  requiresActive?: boolean;
  roles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly billingService = inject(BillingService);
  private readonly notificationService = inject(NotificationService);

  sidebarOpen = signal(true);
  billingMenuOpen = signal(false);
  isBillingLoading = signal(false);

  subscriptionStatus = signal<{
    hasSubscription: boolean;
    plan?: string;
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string;
  } | null>(null);

  protected readonly environment = environment;
  protected readonly isTrial = this.authService.isTrial;
  protected readonly userName = (() => {
    const p = this.authService.getPayload();
    return [p?.firstName, p?.lastName].filter(Boolean).join(' ');
  })();
  protected readonly rol = this.authService.getPayload()?.role;


  navGroups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['OWNER', 'ADMIN'] },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Users', icon: 'users', route: '/users', requiresActive: true, roles: ['OWNER', 'ADMIN'] },
        { label: 'Locations', icon: 'locations', route: '/locations', requiresActive: true, roles: ['OWNER', 'ADMIN'] },
        { label: 'Authorities', icon: 'authorities', route: '/authorities', requiresActive: true, roles: ['OWNER', 'ADMIN'] },
      ],
    },
    {
      title: 'Compliance',
      items: [
        { label: 'Compliances', icon: 'compliances', route: '/compliances', requiresActive: true },
        { label: 'Reports', icon: 'reports', route: '/reports', requiresActive: true, roles: ['OWNER'] },
      ],
    },
  ];

  get filteredNavGroups(): NavGroup[] {
    return this.navGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => !item.roles || item.roles.includes(this.rol ?? ''))
      }))
      .filter(group => group.items.length > 0);
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  toggleBillingMenu() {
    this.billingMenuOpen.update(v => !v);
    // Carga el status la primera vez que el usuario abre el dropdown — lazy loading.
    // Evita llamar al API en cada login y los problemas de ciclo de vida de effect() con HTTP.
    if (this.billingMenuOpen() && this.subscriptionStatus() === null) {
      this.billingService.getSubscriptionStatus().subscribe({
        next: (status) => this.subscriptionStatus.set(status),
        error: () => this.subscriptionStatus.set({ hasSubscription: false })
      });
    }
  }

  cancelSubscription() {
    this.isBillingLoading.set(true);
    this.billingMenuOpen.set(false);
    this.billingService.cancelSubscription().subscribe({
      next: () => {
        this.isBillingLoading.set(false);
        this.subscriptionStatus.update(s => s ? { ...s, cancelAtPeriodEnd: true } : s);
        const endDate = this.subscriptionStatus()?.currentPeriodEnd
          ? new Date(this.subscriptionStatus()!.currentPeriodEnd!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'the end of your billing period';
        this.notificationService.show(`Subscription cancelled — you have full access to all features until ${endDate}`);
      },
      error: () => {
        this.isBillingLoading.set(false);
        this.notificationService.show('Error cancelling subscription, try again');
      }
    });
  }

  resumeSubscription() {
    this.isBillingLoading.set(true);
    this.billingMenuOpen.set(false);
    this.billingService.resumeSubscription().subscribe({
      next: () => {
        this.isBillingLoading.set(false);
        this.subscriptionStatus.update(s => s ? { ...s, cancelAtPeriodEnd: false } : s);
        this.notificationService.show('Subscription renewed — your plan will continue automatically');
      },
      error: () => {
        this.isBillingLoading.set(false);
        this.notificationService.show('Error resuming subscription, try again');
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
