import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Plan {
    name: string;
    price: number;
    maxEmployees: string;
    maxLocations: string;
    features: string[];
    highlighted: boolean;
}

@Component({
    selector: 'app-pricing',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './pricing.component.html',
})
export class PricingComponent {
    public readonly plans: Plan[] = [
        {
            name: 'Starter',
            price: 99,
            maxEmployees: '20 employees',
            maxLocations: '5 locations',
            highlighted: false,
            features: [
                'Up to 20 employees',
                'Up to 5 locations',
                'License & permit tracking',
                'Document storage',
                'Email expiry alerts',
                'Audit log',
                'CSV export',
            ],
        },
        {
            name: 'Pro',
            price: 199,
            maxEmployees: '40 employees',
            maxLocations: '10 locations',
            highlighted: true,
            features: [
                'Up to 40 employees',
                'Up to 10 locations',
                'License & permit tracking',
                'Document storage',
                'Email expiry alerts',
                'Audit log',
                'CSV export',
                'Priority support',
            ],
        },
        {
            name: 'Advance',
            price: 399,
            maxEmployees: 'Unlimited employees',
            maxLocations: 'Unlimited locations',
            highlighted: false,
            features: [
                'Unlimited employees',
                'Unlimited locations',
                'License & permit tracking',
                'Document storage',
                'Email expiry alerts',
                'Audit log',
                'CSV export',
                'Priority support',
                'Dedicated onboarding',
            ],
        },
    ];
}
