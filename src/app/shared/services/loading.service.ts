import { Injectable, signal } from '@angular/core';

// Contador de requests concurrentes — el overlay no desaparece hasta que todas terminen
// El jwtInterceptor llama show/hide automáticamente; no hacerlo manualmente en componentes
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = 0;
  isLoading = signal(false);

  show() {
    this.activeRequests++;
    this.isLoading.set(true);
  }

  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) this.isLoading.set(false);
  }
}
