import { Component } from '@angular/core';

@Component({
    selector: 'app-refund',
    standalone: true,
    imports: [],
    templateUrl: './refund.component.html',
})
export class RefundComponent {
    public readonly effectiveDate = 'June 23, 2026';
}
