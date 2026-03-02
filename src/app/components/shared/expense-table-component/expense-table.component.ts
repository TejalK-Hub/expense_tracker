import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpensesService } from '../../../service/expenses.service';

@Component({
  selector: 'app-expense-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-table.component.html',
  styleUrl: './expense-table.component.scss',
})
export class ExpenseTableComponent {

  constructor(
    private expensesService: ExpensesService,
    private router: Router
  ) {}

  // ---------------- FILTER STATE ----------------

  selectedStatus: string = '';
  selectedDate: string = '';

  // ---------------- DATA SOURCE ----------------

  get expenses() {
    return this.expensesService.expenses;
  }

  // ---------------- UNIQUE VALUES ----------------

  getUniqueStatuses() {
    return [...new Set(this.expenses.map(e => e.status))];
  }

  getUniqueDates() {
    return [...new Set(this.expenses.map(e => e.date))];
  }

  // ---------------- FILTERED DATA ----------------

  getFilteredExpenses() {
    return this.expenses.filter(exp => {

      const statusMatch =
        !this.selectedStatus ||
        this.selectedStatus === 'All' ||
        exp.status.toLowerCase().trim() ===
        this.selectedStatus.toLowerCase().trim();

      const dateMatch =
        !this.selectedDate ||
        new Date(exp.date).toISOString().slice(0, 10) ===
        new Date(this.selectedDate).toISOString().slice(0, 10);

      return statusMatch && dateMatch;
    });
  }

  // ---------------- OPEN PREVIEW ----------------

  openPreview(exp: any) {
    this.expensesService.setSelectedExpense(exp);
    this.router.navigate(['/expense-preview']);
  }
}
