import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-add-expense-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './add-expense-page.component.html',
  styleUrl: './add-expense-page.component.scss'
})
export class AddExpensePageComponent {

}
