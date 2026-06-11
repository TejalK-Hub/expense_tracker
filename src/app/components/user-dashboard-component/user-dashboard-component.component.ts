import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthServiceService } from '../../service/auth-service.service';
import { ExpensesService } from '../../service/expenses.service';

import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { ExpandableButtonComponent } from './../shared/expandable-button-component/expandable-button.component';
import { DashboardBlockComponent } from './../shared/dashboard-block-component/dashboard-block.component';
import { ExpenseTableComponent } from '../shared/expense-table-component/expense-table.component';
import { ButtonComponent } from '../shared/button/button.component';
import { PendingExpenseTableComponent } from './pending-expense-table/pending-expense-table.component';


@Component({
  selector: 'app-user-dashboard-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    ButtonComponent,
    DashboardBlockComponent,
    ExpandableButtonComponent,
    ExpenseTableComponent,
    PendingExpenseTableComponent,
    QuickActionsComponent,
  ],
  templateUrl: './user-dashboard-component.component.html',
  styleUrl: './user-dashboard-component.component.scss',
})


export class UserDashboardComponentComponent {
  constructor(
    private route: Router,
    private authService: AuthServiceService,
    private expenseService: ExpensesService
  ) { }


  Amount = 400;
  current_month = '';
  summary_current_month: any;

  startMonth: string = '';
  endMonth: string = '';


  ngOnInit() {
    this.setDefaultMonthRange();

    this.expenseService.fetchExpenses().subscribe((res: any) => {
      const expenses = res.data;
      this.summary_current_month = this.calculateSummary(expenses);
    });
  }


  //----------------------------------------------------------------- INITIALIZATION METHODS ---------------------------------------------------------
  setDefaultMonthRange() {
    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    this.startMonth = this.formatMonthInput(start);
    this.endMonth = this.formatMonthInput(end);

    this.setDateRangeLabel();
  }

  formatMonthInput(date: Date): string {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    return `${year}-${month}`;
  }

  setDateRangeLabel() {
    const start = new Date(this.startMonth + '-01');
    const end = new Date(this.endMonth + '-01');

    const format = (d: Date) =>
      d.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });

    this.current_month =
      `${format(start)} - ${format(end)}`;
  }


  //----------------------------------------------------------------- INITIALIZATION METHODS ---------------------------------------------------------
  onMonthRangeChange() {
    this.setDateRangeLabel();

    this.expenseService.fetchExpenses().subscribe((res: any) => {
      this.summary_current_month =
        this.calculateSummary(res.data);
    });
  }

  calculateSummary(expenses: any[]) {
    const start = new Date(this.startMonth + '-01');
    const end = new Date(this.endMonth + '-01');

    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    const summary = {
      submitted: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      total_count: 0,
      total_amount: 0
    };

    expenses.forEach(exp => {
      const expDate = new Date(exp.expense_date);

      if (expDate < start || expDate > end) return;

      const status = exp.status?.toLowerCase();
      const amount = this.extractAmount(exp.amount);

      if (status === 'submitted') {
        summary.submitted.count++;
        summary.submitted.amount += amount;
      } else if (status === 'approved') {
        summary.approved.count++;
        summary.approved.amount += amount;
      } else if (status === 'rejected') {
        summary.rejected.count++;
        summary.rejected.amount += amount;
      }

      summary.total_count++;
      summary.total_amount += amount;
    });

    return summary;
  }

  extractAmount(amount: string): number {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
  }


  //----------------------------------------------------------------- NAVIGATION METHODS ---------------------------------------------------------
  goToMonthlyExpenses() {
    const start = new Date(this.startMonth + '-01');
    const end = new Date(this.endMonth + '-01');

    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    const format = (d: Date) => d.toISOString().split('T')[0];

    this.route.navigate(['/manage-expense'], {
      queryParams: {
        dateFrom: format(start),
        dateTo: format(end)
      }
    });
  }

  goToFilteredExpenses(status: string) {
    const start = new Date(this.startMonth + '-01');
    const end = new Date(this.endMonth + '-01');

    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    const format = (d: Date) => d.toISOString().split('T')[0];

    this.route.navigate(['/manage-expense'], {
      queryParams: {
        status: status,
        dateFrom: format(start),
        dateTo: format(end)
      }
    });
  }

  viewVisits() {
    this.route.navigate(['/visits']);
  }

  goToManageExpense() {
    this.route.navigate(['/manage-expense']);
  }


  //----------------------------------------------------------------- LOGOUT -----------------------------------------------------------------
  logout() {
    this.route.navigate(['']);
    this.authService.logout();
  }

  
}
