import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() mainIcon: string = '';
  @Input() mainLabel: string = '';

  @Output() actionClick = new EventEmitter<string>();

  onClick(type: string) {
    this.actionClick.emit(type);
  }

}
