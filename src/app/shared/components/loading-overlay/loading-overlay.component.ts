import { Component, inject } from '@angular/core';
import { LoadingService } from '@shared/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  imports: [],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css',
})
export class LoadingOverlayComponent {
  protected readonly loadingService = inject(LoadingService);
}
