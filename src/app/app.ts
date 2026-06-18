import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ToastComponent, LoadingOverlayComponent } from '@shared/components';
import { environment } from 'environments';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlayComponent, ToastComponent],
  standalone:true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {
    inject(Title).setTitle(environment.appName);
  }
}
