import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { DropDownButtonComponent } from '../../shared/drop-down-button/drop-down-button.component';
import { AddReceiptComponent } from '../add-receipt/add-receipt.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExpensesService } from '../../../service/expenses.service';
import { CategoryOption } from '../../shared/shared/category-options-drop-down-model';

@Component({
  selector: 'app-add-expense-form',
  standalone: true,
  imports: [
    ButtonComponent,
    InputComponent,
    DropDownButtonComponent,
    AddReceiptComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './add-expense-form.component.html',
})
export class AddExpenseFormComponent {
  constructor(
    private expensesService: ExpensesService,
    private router: Router,
  ) {
  }

  submitted: boolean = false;
  loading: boolean = false;
  selectedFile: File | null = null;
  amount: number = 0;
  description: string = ''

  fileOnChange(event: any) {
    console.log('File selected:', event.target.files);
    this.selectedFile = event.target.files[0] ?? null;
  }

  onSubmit() {
    if(!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    const receiptId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    formData.append('receipt_id', `TESTING_${receiptId}`);
    formData.append('description', 'Sample Expense for Testing');
    formData.append('visit_id', '3');
    formData.append('date', '2027-02-01');
    formData.append('category_id', '1');
    formData.append('amount', '200.1');
    formData.append('bill', this.selectedFile); 

    this.expensesService.addExpense(formData).subscribe({
      next: (response) => {
        console.log('Expense Added Successfully:', response);
      }, 
      error: (err) => {
        console.error('Error adding expense:', err);
      }
    });

  }
}
