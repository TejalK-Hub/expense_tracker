import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { DropDownButtonComponent } from '../../shared/drop-down-button/drop-down-button.component';
import { AddReceiptComponent } from '../add-receipt/add-receipt.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-expense-page',
  standalone: true,
  imports: [ButtonComponent, InputComponent, DropDownButtonComponent, AddReceiptComponent, FormsModule],
  templateUrl: './add-expense-page.component.html',
  styleUrl: './add-expense-page.component.scss'
})
export class AddExpensePageComponent {

amount: number = 0;
description: string = '';
// category: string = '';

}
