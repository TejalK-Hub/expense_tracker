import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-block',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-block.component.html',
  styleUrl: './dashboard-block.component.scss'
})
export class DashboardBlockComponent {

  @Input() header: string = '';
  @Input() title: string = '';
  @Input() content: string = '';

}
