import { Component } from '@angular/core';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { ExpandableButtonComponent } from './../shared/expandable-button-component/expandable-button.component';
import { DashboardBlockComponent } from './../shared/dashboard-block-component/dashboard-block.component';
import { ExpenseTableComponent } from '../shared/expense-table-component/expense-table.component';
import { ButtonComponent } from '../shared/button/button.component';
import { Router } from '@angular/router';
import { PendingExpenseTableComponent } from './pending-expense-table/pending-expense-table.component';
import { AuthServiceService } from '../../service/auth-service.service';
import { ExpensesService } from '../../service/expenses.service';

@Component({
  selector: 'app-user-dashboard-component',
  standalone: true,
  imports: [
    ButtonComponent,
    DashboardBlockComponent,
    ExpandableButtonComponent,
    ExpenseTableComponent,
    QuickActionsComponent,
    PendingExpenseTableComponent,
  ],
  templateUrl: './user-dashboard-component.component.html',
  styleUrl: './user-dashboard-component.component.scss',
})
export class UserDashboardComponentComponent {
  constructor(private route: Router, private authService: AuthServiceService, private expenseService: ExpensesService) { }

  Amount = 400;
  current_month = '';
  summary_current_month: any;

  ngOnInit() {
    const now = new Date();

    this.current_month = now.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });

    this.expenseService.fetchExpense().subscribe((res: any) => {
      const expenses = res.data;

      this.summary_current_month = this.calculateSummary(expenses);
      console.log("Computed Summary:", this.summary_current_month);
    });
  }


  //-----------------------------------------------------------------Cards Summary Calculation Logic---------------------------------------------------------

  calculateSummary(expenses: any[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const summary = {
      submitted: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      total_count: 0,
      total_amount: 0
    };

    expenses.forEach(exp => {

      const expDate = new Date(exp.expense_date);

      // ✅ Filter only current month
      if (
        expDate.getMonth() !== currentMonth ||
        expDate.getFullYear() !== currentYear
      ) {
        return;
      }

      const status = exp.status?.toLowerCase();

      // ✅ Extract numeric amount
      const amount = this.extractAmount(exp.amount);

      if (status === 'submitted') {
        summary.submitted.count++;
        summary.submitted.amount += amount;
      }

      else if (status === 'approved') {
        summary.approved.count++;
        summary.approved.amount += amount;
      }

      else if (status === 'rejected') {
        summary.rejected.count++;
        summary.rejected.amount += amount;
      }

      // ✅ Totals
      summary.total_count++;
      summary.total_amount += amount;

    });

    return summary;
  }


  //------------------------------Click on Card to go to Filtered Expense Table---------------------------------------


  goToMonthlyExpenses() {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d: Date) => d.toISOString().split('T')[0];

    this.route.navigate(['/manage-expense'], {
      queryParams: {
        dateFrom: format(start),
        dateTo: format(end)
      }
    });
  }


  goToFilteredExpenses(status: string) {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d: Date) => d.toISOString().split('T')[0];

    this.route.navigate(['/manage-expense'], {
      queryParams: {
        status: status,
        dateFrom: format(start),
        dateTo: format(end)
      }
    });
  }


  //-----------------------------------------------------------------Normalize Data---------------------------------------------------------

  extractAmount(amount: string): number {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
  }







  viewVisits() {
    this.route.navigate(['/visits']);
  }

  handleExpense(option: number) {
    if (option === 1) {
      this.route.navigate(['/add-expense']);
    } else if (option === 2) {
      this.route.navigate(['/manage-expense']);
    } else if (option === 3) {
      this.route.navigate(['/review-expense']);
    }
  }


  //--------------------------------------------------Depricated Visits Approach-----------------------------------------
  // handleVisit(option: number){
  //   if (option===1){
  //     this.route.navigate(['/add-visit']);
  //   }else{
  //     this.route.navigate(['/visits']);
  //   }
  // }


  logout() {
    this.route.navigate(['']);
    this.authService.logout();
  }

}
