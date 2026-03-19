import { Component, ViewChild, ElementRef } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { DropDownButtonComponent } from '../../shared/drop-down-button/drop-down-button.component';
import { AddReceiptComponent } from '../add-receipt/add-receipt.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExpensesService } from '../../../service/expenses.service';
import { AuthServiceService } from '../../../service/auth-service.service';
import { CategoryOption } from '../../shared/shared/category-options-drop-down-model';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { expand } from 'rxjs';

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
    BackButtonComponent
  ],
  templateUrl: './add-expense-form.component.html',
  styleUrl: './add-expense-form.component.scss',
})
export class AddExpenseFormComponent {
  constructor(
    private expensesService: ExpensesService,
    private router: Router,
    private authService: AuthServiceService
  ) { }


  @ViewChild('fileInput') fileInput!: ElementRef;
  //---------------------------------------------------------Form Properties----------------------------------------------------------

  submitted: boolean = false;
  loading: boolean = false;
  selectedFile: File | null = null;


  selectedCategory: string = '';
  categories: CategoryOption[] = [
    { name: 'Travel', id: 1 },
    { name: 'Food', id: 2 },
    { name: 'Stay', id: 8 },
    { name: 'Other', id: 5 },
  ];


  description: string = '';
  amount: string = '';
  date: string = '';
  receiptNo: string = '';
  visit: string = '';



  //------------------------------------------------------------Functions-----------------------------------------------------------------

  fileOnChange(event: any) {
    console.log('File selected:', event.target.files);
    this.selectedFile = event.target.files[0] ?? null;
  }

  onSubmit() {

    this.router.navigate(['/user-dashboard'], { replaceUrl: true });

    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    if (
      !this.description ||
      !this.amount ||
      !this.date ||
      !this.receiptNo ||
      !this.visit
    ) {
      console.error('Please fill all required fields');
      // return;
    }


    //-----------------------------------------Populating the form data to be sent to the backend---------------------------------------------
    const formData = new FormData();
    const receiptId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    formData.append(
      'category_id',
      (this.categories.find(c => c.name == this.selectedCategory)?.id ?? '').toString()
    );
    formData.append('date', this.date);

    formData.append('bill', this.selectedFile);

    formData.append('amount', this.amount.toString());
    formData.append('receipt_id', `TESTING_${this.receiptNo}`);
    formData.append('visit_id', this.visit);
    formData.append('description', this.description);
    // formData.append('user_id', this.authService.userId?.toString() ?? '0');



    formData.forEach((value, key) => {
      console.log(key, ' :: ', value);
    });

    this.expensesService.addExpense(formData).subscribe({
      next: (response) => {
        console.log('Expense Added Successfully:', response);
      },
      error: (err) => {
        // console.error('Error adding expense:', err);
      },
    });
  }


  onClear() {
    this.selectedCategory = '';
    this.description = '';
    this.amount = '';
    this.date = '';
    this.receiptNo = '';
    this.visit = '';
    if (this.selectedFile) {
      this.fileInput.nativeElement.value = '';
    }
  }

  editExpense(category: string, expense_date: string, amount: string, receipt: string,  visit: number, expense: string, bill_path: string, id: number, status: "Rejected") {
    this.amount = amount;
    this.date = expense_date;
  }

}
