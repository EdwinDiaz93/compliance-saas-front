import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-privacy',
    standalone: true,
    templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
    public readonly effectiveDate = 'June 23, 2026';
}
