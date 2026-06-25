import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BillingService, BillingPlan } from '@features/billing/services/billing.service';
import { NotificationService } from '@shared/services/notification.service';
import { SharedModule } from '@shared/shared-module';

const PLAN_ORDER: Record<BillingPlan, number> = { STARTER: 1, PRO: 2, ADVANCE: 3 };

interface Plan {
    id: BillingPlan;
    name: string;
    price: number;
    maxEmployees: string;
    maxLocations: string;
    features: string[];
    highlighted: boolean;
}

@Component({
    selector: 'app-manage',
    imports: [SharedModule],
    templateUrl: './manage.component.html',
})
export class ManageComponent implements OnInit {
    private readonly billingService = inject(BillingService);
    private readonly notificationService = inject(NotificationService);

    public loadingPlan = signal<BillingPlan | null>(null);
    public currentPlan = signal<BillingPlan | null>(null);
    public cancelAtPeriodEnd = signal(false);
    public currentPeriodEnd = signal<string | null>(null);
    public loadingStatus = signal(true);

    public readonly plans: Plan[] = [
        {
            id: 'STARTER',
            name: 'Starter',
            price: 99,
            maxEmployees: '20 employees',
            maxLocations: '5 locations',
            highlighted: false,
            features: ['Up to 20 employees', 'Up to 5 locations', 'License & permit tracking', 'Document storage', 'Email expiry alerts', 'Audit log', 'CSV export'],
        },
        {
            id: 'PRO',
            name: 'Pro',
            price: 199,
            maxEmployees: '40 employees',
            maxLocations: '10 locations',
            highlighted: true,
            features: ['Up to 40 employees', 'Up to 10 locations', 'License & permit tracking', 'Document storage', 'Email expiry alerts', 'Audit log', 'CSV export', 'Priority support'],
        },
        {
            id: 'ADVANCE',
            name: 'Advance',
            price: 399,
            maxEmployees: 'Unlimited employees',
            maxLocations: 'Unlimited locations',
            highlighted: false,
            features: ['Unlimited employees', 'Unlimited locations', 'License & permit tracking', 'Document storage', 'Email expiry alerts', 'Audit log', 'CSV export', 'Priority support', 'Dedicated onboarding'],
        },
    ];

    ngOnInit() {
        this.billingService.getSubscriptionStatus().subscribe({
            next: (res) => {
                this.currentPlan.set((res.plan as BillingPlan) ?? null);
                this.cancelAtPeriodEnd.set(res.cancelAtPeriodEnd ?? false);
                this.currentPeriodEnd.set(res.currentPeriodEnd ?? null);
                this.loadingStatus.set(false);
            },
            error: () => this.loadingStatus.set(false),
        });
    }

    isCurrentPlan(planId: BillingPlan): boolean {
        return this.currentPlan() === planId;
    }

    isUpgradable(planId: BillingPlan): boolean {
        const current = this.currentPlan();
        if (!current) return false;
        return PLAN_ORDER[planId] > PLAN_ORDER[current];
    }

    upgrade(plan: BillingPlan) {
        this.loadingPlan.set(plan);
        this.billingService.upgradePlan(plan).subscribe({
            next: () => {
                this.loadingPlan.set(null);
                this.notificationService.success('Plan upgrade initiated — your limits will update shortly');
                this.currentPlan.set(plan);
            },
            error: (error: HttpErrorResponse) => {
                this.loadingPlan.set(null);
                this.notificationService.error(error.error?.message ?? 'Error upgrading plan, try again');
            },
        });
    }
}
