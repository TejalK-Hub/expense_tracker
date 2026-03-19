import { Component, OnInit } from '@angular/core';
import { ExpensesService } from '../../../service/expenses.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../../back-button/back-button.component';

@Component({
  selector: 'app-expense-preview-page',
  standalone: true,
  imports: [CommonModule, BackButtonComponent],
  templateUrl: './expense-preview-page.component.html',
  styleUrl: './expense-preview-page.component.scss',
})
export class ExpensePreviewPageComponent {
  expense: any;

  editable: boolean = false;

  constructor(private expenseService: ExpensesService, private router: Router) {}

  ngOnInit() {
    this.expense = this.expenseService.getSelectedExpense();
    if(this.expense.status=='Rejected'){
      this.editable = true;
    }
     // If user refreshes page → redirect back safely
    if (!this.expense) {
      this.router.navigate(['/expenses']);
    }
  }

  editExpense(){
    console.log("Editable: ");
  }

  printReceipt() {
  window.print();
}
}
