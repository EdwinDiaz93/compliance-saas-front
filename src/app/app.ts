import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LoadingOverlayComponent } from '@shared/components/loading-overlay/loading-overlay.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { environment } from 'environments';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlayComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {
    inject(Title).setTitle(environment.appName);
  }
}
