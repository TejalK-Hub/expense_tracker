// 
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
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ExpandableButtonComponent,
    PendingExpenseTableComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {

  constructor(
    private route: Router,
    private authService: AuthServiceService,
    private expenseService: ExpensesService,
    private userService: UsersService
  ) { }

  // ---------------- BASIC COUNTS ----------------
  userCount: number = 0;

  // ---------------- SUMMARY CARD ----------------
  summary_current_period: any = null;
  selectedUserId: number | null = null;
  usersList: any[] = [];
  current_period_label = '';

  allExpenses: any[] = [];
  tableData: any[] = [];

  status = 'Pending';

  ngOnInit() {

    // ---------------- PENDING TABLE ----------------
    this.expenseService.fetchAdminPending().subscribe((res: any) => {

      console.log('Raw Pending Data:', res.data);

      this.tableData = this.removeDuplicateRecords(res.data || []);

      console.log('Dedup Pending Data:', this.tableData);
    });

    // ---------------- USERS COUNT ----------------
    this.userService.getUsers().subscribe((res: any) => {

      const users = this.removeDuplicateUsers(res.data || []);

      this.userCount = users.length;

      console.log('Unique Users:', users);
    });

    this.expenseService.fetchExpenses().subscribe((res: any) => {

      console.log('Raw Expense Data:', res.data);

      this.allExpenses = this.removeDuplicateRecords(res.data || []);

      console.log('Dedup Expense Data:', this.allExpenses);

      this.usersList = this.getUniqueUsers(this.allExpenses);

      this.setDateRangeLabel();
      this.calculateSummary();
    });
  }

  // ------------------------------------------------------------------------------------------------
  // ---------------------------------- DUPLICATE REMOVAL -------------------------------------------
  // ------------------------------------------------------------------------------------------------

  removeDuplicateRecords(data: any[]) {
    const seen = new Set();

    return data.filter(exp => {

      const uniqueKey = `${exp.id}-${exp.user_id}-${exp.expense_date}-${exp.amount}`;

      if (seen.has(uniqueKey)) {
        return false;
      }

      seen.add(uniqueKey);
      return true;
    });
  }

  removeDuplicateUsers(users: any[]) {
    const seen = new Set();

    return users.filter((user: any) => {

      const uniqueKey = user.id || user.user_id;

      if (seen.has(uniqueKey)) {
        return false;
      }

      seen.add(uniqueKey);
      return true;
    });
  }

  // ------------------------------------------------------------------------------------------------
  // ---------------------------------- ROUTING -----------------------------------------------------
  // ------------------------------------------------------------------------------------------------

  listUsers() {
    this.route.navigate(['/admin-review-expense']);
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

  goToExpenseTable() {
    this.route.navigate(['/user-expense-review']);
  }

  handleRouting(option: number) {

    switch (option) {
      case 1:
        this.route.navigate(['/add-expense']);
        break;

      case 2:
        this.route.navigate(['/user-expense-review']);
        break;

      default:
        console.warn('Invalid option:', option);
    }
  }

  // ------------------------------------------------------------------------------------------------
  // ---------------------------------- SUMMARY CARD ------------------------------------------------
  // ------------------------------------------------------------------------------------------------

  setDateRangeLabel() {
    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    const format = (d: Date) =>
      d.toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });

    this.current_period_label = `${format(start)} - ${format(end)}`;
  }

  onUserChange(value: any) {
    if (value) {
      this.calculateSummary();
    }
  }


  calculateSummary() {

    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    const summary = {
      submitted: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      total_count: 0,
      total_amount: 0
    };

    this.allExpenses.forEach(exp => {

      const expDate = new Date(exp.expense_date);

      // ---------------- DATE FILTER ----------------
      if (expDate < start || expDate > end) return;

      // ---------------- USER FILTER ----------------
      if (
        this.selectedUserId !== null &&
        exp.user_id !== this.selectedUserId
      ) {
        return;
      }

      const status = exp.status?.toLowerCase()?.trim();
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

      summary.total_count++;
      summary.total_amount += amount;
    });

    this.summary_current_period = summary;

    console.log('Summary:', this.summary_current_period);
  }

  extractAmount(amount: string): number {
    if (!amount) return 0;

    return parseFloat(
      amount.toString().replace(/[^\d.]/g, '')
    ) || 0;
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

  // ------------------------------------------------------------------------------------------------
  // ---------------------------------- SUMMARY FILTER ROUTING --------------------------------------
  // ------------------------------------------------------------------------------------------------

  goToMonthlyExpenses() {

    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    const format = (d: Date) =>
      d.toISOString().split('T')[0];

    const queryParams: any = {
      dateFrom: format(start),
      dateTo: format(end)
    };

    if (this.selectedUserId !== null) {
      queryParams.userId = this.selectedUserId;
    }


    this.route.navigate(
      ['/user-expense-review'],
      { queryParams }
    );
  }

  goToFilteredExpenses(status: string) {

    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    const format = (d: Date) =>
      d.toISOString().split('T')[0];

    const queryParams: any = {
      status,
      dateFrom: format(start),
      dateTo: format(end)
    };

    if (this.selectedUserId !== null) {
      queryParams.userId = this.selectedUserId;
    }

    this.route.navigate(
      ['/user-expense-review'],
      { queryParams }
    );
  }

  // ------------------------------------------------------------------------------------------------
  // ---------------------------------- LOGOUT ------------------------------------------------------
  // ------------------------------------------------------------------------------------------------

  logout() {
    this.route.navigate(['']);
    this.authService.logout();
  }
}