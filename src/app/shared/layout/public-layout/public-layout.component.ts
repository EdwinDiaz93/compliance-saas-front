import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink],
    templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
    public readonly year = new Date().getFullYear();
}
