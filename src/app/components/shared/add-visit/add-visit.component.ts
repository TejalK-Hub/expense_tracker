import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-visit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-visit.component.html',
  styleUrl: './add-visit.component.scss'
})
export class AddVisitComponent {



  s_date: string = '';
  e_date: string = '';
  cli_name: string = '';
  agenda: string = '';
  
  
}
