import { Component, OnInit } from '@angular/core';
import { ExpensesService } from '../../../service/expenses.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense-preview-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-preview-page.component.html',
  styleUrl: './expense-preview-page.component.scss',
})
export class ExpensePreviewPageComponent {
  expense: any;

  constructor(private expenseService: ExpensesService, private router: Router) {}

  ngOnInit() {
    this.expense = this.expenseService.getSelectedExpense();
     // If user refreshes page → redirect back safely
    if (!this.expense) {
      this.router.navigate(['/expenses']);
    }
  }
}
