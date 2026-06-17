import { Component, inject } from '@angular/core';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  protected readonly notificationService = inject(NotificationService);
}
