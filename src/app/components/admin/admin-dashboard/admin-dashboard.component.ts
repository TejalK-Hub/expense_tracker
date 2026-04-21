import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import { ExpandableButtonComponent } from '../../shared/expandable-button-component/expandable-button.component';
import { Router } from '@angular/router';
import { PendingExpenseTableComponent } from '../../user-dashboard-component/pending-expense-table/pending-expense-table.component';
import { AuthServiceService } from '../../../service/auth-service.service';
import { ExpensesService } from '../../../service/expenses.service';
import { UsersService } from '../../../service/users.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ExpandableButtonComponent, PendingExpenseTableComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  userCount: number = 0;
  constructor(private route: Router, private authService: AuthServiceService, private expenseService: ExpensesService, private userService: UsersService) { }


  //Sumarry Card
  summary_current_period: any;
  selectedUserId: number | null = null;
  usersList: any[] = [];

  current_period_label = '';
  allExpenses: any[] = [];
  // pendingExpenses: any[]=[];

  status = 'Pending';

  tableData: any;
  ngOnInit() {
    this.expenseService.fetchAdminPending().subscribe((res: any) => {
      console.log("28---", res.data)
      this.tableData = res.data

    });

    this.userService.getUsers().subscribe((res: any) => {
      // this.userCount = res.data.length;
      this.userCount = res.data?.length || 0;
    });


    //Summary Card
    this.expenseService.fetchExpenses().subscribe((res: any) => {
      this.allExpenses = res.data || [];

      this.usersList = this.getUniqueUsers(this.allExpenses);

      this.setDateRangeLabel();
      this.calculateSummary();
    });
  }

  listUsers() {
    this.route.navigate(['/admin-review-expense'])
  }

  grafanaReports() {
    window.open('http://localhost:3330/login', '_blank');
  }


  viewClients() {
    this.route.navigate(['/clients']);
  }


  viewVisits() {
    this.route.navigate(['/visits']);
  }

  handleRouting(option: number) {
    console.log('Routing option:', option);

    switch (option) {
      case 1:
        this.route.navigate(['/add-expense']);
        break;

      case 2:
        this.route.navigate(['/user-expense-review']);
        break;

      // case 3:
      //   this.route.navigate(['/admin-review-expense']);
      //   break;

      default:
        console.warn('Invalid option:', option);
    }
  }



  //SUMMARY CARD METHODS
  setDateRangeLabel() {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d: Date) =>
      d.toLocaleString('default', { month: 'short', year: 'numeric' });

    this.current_period_label = `${format(start)} - ${format(end)}`;
  }



  calculateSummary() {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const summary = {
      submitted: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      total_count: 0,
      total_amount: 0
    };

    this.allExpenses.forEach(exp => {
      const expDate = new Date(exp.expense_date);

      // ✅ DATE FILTER
      if (expDate < start || expDate > end) return;

      // ✅ USER FILTER (key part)
      if (this.selectedUserId !== null && exp.user_id !== this.selectedUserId) return;

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

    this.summary_current_period = summary;
  }

  extractAmount(amount: string): number {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
  }

  onUserChange() {
    this.calculateSummary();
  }




  getUniqueUsers(expenses: any[]) {
    const map = new Map<number, any>();

    expenses.forEach(exp => {
      if (!map.has(exp.user_id)) {
        map.set(exp.user_id, {
          id: exp.user_id,
          name: exp.user_name
        });
      }
    });

    return Array.from(map.values());
  }


  // --------------------------------------------- SUMMARY CARD FILTERS ------------------------------------------------

  goToMonthlyExpenses() {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d: Date) => d.toISOString().split('T')[0];

    const queryParams: any = {
      dateFrom: format(start),
      dateTo: format(end)
    };

    // ✅ add user filter if selected
    if (this.selectedUserId !== null) {
      queryParams.userId = this.selectedUserId;
    }

    this.route.navigate(['/user-expense-review'], {
      queryParams
    });
  }


  goToFilteredExpenses(status: string) {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d: Date) => d.toISOString().split('T')[0];

    const queryParams: any = {
      status: status,
      dateFrom: format(start),
      dateTo: format(end)
    };

    // ✅ add user filter if selected
    if (this.selectedUserId !== null) {
      queryParams.userId = this.selectedUserId;
    }

    this.route.navigate(['/user-expense-review'], {
      queryParams
    });
  }

  //--------------------------------------------Pending Expense Table------------------------------------------------



  // this.expenseService




  // firstClick = true;

  // toggleStatus(exp: any, action: any) {

  //   const body = {
  //     "action": action
  //   }

  //   this.expenseService.updateExpense(exp.id, body).subscribe((res: any) => {
  //     if (res.success == true) {
  //       if (body.action == 'approve') {
  //         alert('Expense Approve Successfully');

  //         this.ngOnInit();
  //       }
  //       else if (body.action == 'reject') {

  //         alert('Expense Rejected Successfully');
  //         this.ngOnInit();
  //       }

  //     }
  //   })

  // }



  // get pendingExpenses() {
  //   return this.expenseService.pendingExpenses;
  // }

  // getPendingExpenses() {
  //   return this.pendingExpenses.filter((exp: any) => {
  //     exp.status.toLowerCase().trim() === 'Submitted'.toLowerCase().trim();
  //   });
  // }

  logout() {
    this.route.navigate(['']);
    this.authService.logout();
  }
}
