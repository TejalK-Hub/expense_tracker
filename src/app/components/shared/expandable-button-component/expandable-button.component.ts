import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expandable-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expandable-button.component.html',
  styleUrl: './expandable-button.component.scss'
})
export class ExpandableButtonComponent {
  
  //Configurable Button Inputs
  @Input() mainIcon: string = '';
  @Input() mainLabel: string = '';

  @Input() one: string = '';
  @Input() two: string = '';
  @Input() three: string = '';

  expanded = false;
  isAdmin = true;

  @Output() optionClicked = new EventEmitter<number>();

  toggleButton(){
    this.expanded = !this.expanded;
  }

  handleClick(option: number) {
    this.optionClicked.emit(option);
  }



}
