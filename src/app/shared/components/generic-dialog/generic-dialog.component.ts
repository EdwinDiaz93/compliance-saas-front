import { Component, EventEmitter, Input, Output } from '@angular/core';



@Component({
  selector: 'app-generic-dialog',
  imports: [],
  standalone: true,
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.css',
})
export class GenericDialogComponent {
  @Input() title: string = '';
  


  @Output() onCancelClick: EventEmitter<void> = new EventEmitter();

  

  onCancel = () => this.onCancelClick.emit()
}
