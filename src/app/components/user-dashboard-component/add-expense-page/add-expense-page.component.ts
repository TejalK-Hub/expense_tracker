import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { DropDownButtonComponent } from '../../shared/drop-down-button/drop-down-button.component';
import { AddReceiptComponent } from '../add-receipt/add-receipt.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExpensesService } from '../../../service/expenses.service';
import { CategoryOption } from '../../shared/shared/category-options-drop-down-model';
import { AddExpenseFormComponent } from '../add-expense-form/add-expense-form.component';

@Component({
  selector: 'app-add-expense-page',
  standalone: true,
  imports: [
    ButtonComponent,
    InputComponent,
    DropDownButtonComponent,
    AddReceiptComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AddExpenseFormComponent,
  ],
  templateUrl: './add-expense-page.component.html',
  styleUrl: './add-expense-page.component.scss',
})
export class AddExpensePageComponent {
  constructor(
    private expensesService: ExpensesService,
    private router: Router,
  ) {}

  submitted: boolean = false;
  loading: boolean = false;
  selectedFile: File | null = null;
  amount: number = 0;
  description: string = '';

  expenseName: string = '';
  date: string = '';
  category: string = '';
  receiptNo: string = '';
  receiptFileName: string = '';
  visit: string = '';

  selectedCategory: string = 'Travel';

  categories: CategoryOption[] = [
    { name: 'Travel', id: 1},
    { name: 'Food', id: 2},
    { name: 'Stay', id: 8},
    // { name: 'Petrol', id: 3},
    // { name: 'Material', id: 4},
    // { name: 'Toll Updated', id: 6},
    // { name: 'Courier', id: 7},
    { name: 'Other', id: 5},
  ];

  saveExpense() {
    const newExpense = {
      expense: this.expenseName,
      date: this.date,
      category: this.selectedCategory,
      receipt: this.receiptFileName,
      receiptNo: this.receiptNo,
      description: this.description,
      amount: this.amount,
      visit: this.visit,
    };

    // this.expensesService.addExpense(newExpense);

    console.log('Expense Added:', newExpense);

    // this.router.navigate(['/user-dashboard'], {
    //   state: { added: true },
    // });
    this.router.navigate(['/user-dashboard'], { replaceUrl: true });
  }

  fileOnChange(event: any) {
    console.log('File selected:', event.target.files);
    this.selectedFile = event.target.files[0] ?? null;
  }

  onFileReceived(fileName: string) {
    console.log('Received from child:', fileName);
  }

  onSubmit() {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    this.submitted = true;

    const formData = new FormData();
    // formData.append('username', this.userform.value.username);
    // formData.append('email', this.userform.value.email);
    // formData.append('password', this.userform.value.password);
    const receiptId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    formData.append('receipt_id', `TESTING_${receiptId}`);
    formData.append('description', 'Sample Expense for Testing');
    formData.append('visit_id', '3');
    formData.append('date', '2027-02-01');
    formData.append('category_id', '1');
    formData.append('amount', '200.1');

    formData.append('bill', this.selectedFile);

    // if (this.selectedFile) {
    //   console.log(this.selectedFile)
    // }

    this.expensesService.addExpense(formData).subscribe({
      next: (response) => {
        console.log('Expense Added Successfully:', response);
      },
      error: (err) => {
        console.error('Error adding expense:', err);
      },
    });

    // this.loading = true;

    // console.log('Form Data:', formData);
  }
}
