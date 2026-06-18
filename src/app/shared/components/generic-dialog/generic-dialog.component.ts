import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-generic-dialog.component',
  imports: [],
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.css',
})
export class GenericDialogComponent {
  @Input() firstButtonText: string = '';
  @Input() secondButtonText: string = '';
  @Input() thirdButtonText: string = '';

  @Output() onFirstClick: EventEmitter<void> = new EventEmitter();
  @Output() onSecondClick: EventEmitter<void> = new EventEmitter();
  @Output() onThirdClick: EventEmitter<void> = new EventEmitter();

  firstClick = () => this.onFirstClick.emit();
  secondClick = () => this.onSecondClick.emit();
  thirdClick = () => this.onThirdClick.emit();
}
