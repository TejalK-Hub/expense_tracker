import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [],
  templateUrl: './action-card.component.html',
  styleUrls: ['./action-card.component.scss'],
})
export class ActionCardComponent {
  @Input() title!: string;
  @Input() icon!: string;
}
