import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpensesService } from '../../../service/expenses.service';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { AuthServiceService } from '../../../service/auth-service.service';

@Component({
  selector: 'app-expense-table',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  templateUrl: './expense-table.component.html',
  styleUrl: './expense-table.component.scss',
})
export class ExpenseTableComponent implements OnInit {

  constructor(
    private authService: AuthServiceService,
    private expensesService: ExpensesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  expenses: any[] = [];
  filteredExpenses: any[] = [];

  sortDirection!: 'asc' | 'desc';
  isAdmin: boolean = false;

  private debounceTimer: any;

  // ---------------- FILTER STATE ----------------

  filters = {
    user: '',
    status: '',
    category: '',
    client: '',
    visit: '',
    dateFrom: '',
    dateTo: '',
    amountMin: null as number | null,
    amountMax: null as number | null
  };

  ngOnInit() {

    this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';

    if (this.isAdmin) {

      this.sortDirection = 'asc';

      this.expensesService.fetchExpenses().subscribe(res => {
        this.expenses = this.normalizeExpenses(res.data);
        this.applyFilters(); // initial load
      });


      // this.route.queryParams.subscribe(params => {
      //   const date = params['date'];
      //   const ids = params['userIds'];

      //   const userIds = ids ? ids.split(',').map((id: string) => +id) : [];

      // });

    } else {

      this.expensesService.fetchExpense().subscribe(res => {
        this.expenses = this.normalizeExpenses(res.data);
        this.applyFilters(); // initial load
      });

    }
  }

  // ---------------- NORMALIZE DATA ----------------

  normalizeExpenses(data: any[]) {
    return data.map((e: any) => ({
      ...e,
      amount_value: this.extractAmount(e.amount)
    }));
  }

  extractAmount(amount: string): number {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
  }

  // ---------------- UNIQUE VALUES ----------------

  getUnique(field: string) {
    return [...new Set(this.expenses.map(e => e[field]).filter(Boolean))];
  }

  // ---------------- DEBOUNCED FILTER APPLY ----------------

  onFilterChange() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.applyFilters();
    }, 300); // 300ms debounce
  }

  // ---------------- FILTER LOGIC ----------------

  applyFilters() {
    const f = this.filters;

    this.filteredExpenses = this.expenses.filter(exp => {

      const userMatch =
  !f.user || exp.user_name === f.user;

      const statusMatch =
        !f.status || exp.status === f.status;

      const categoryMatch =
        !f.category || exp.category === f.category;

      const clientMatch =
        !f.client || exp.client_name === f.client;

      const visitMatch =
        !f.visit || exp.visit_name === f.visit;

      const dateMatch =
        (!f.dateFrom || exp.expense_date >= f.dateFrom) &&
        (!f.dateTo || exp.expense_date <= f.dateTo);

      const amountMatch =
        (f.amountMin === null || exp.amount_value >= f.amountMin) &&
        (f.amountMax === null || exp.amount_value <= f.amountMax);

      return (
        userMatch &&
        statusMatch &&
        categoryMatch &&
        clientMatch &&
        visitMatch &&
        dateMatch &&
        amountMatch
      );
    });
  }

  // ---------------- CLEAR FILTERS ----------------

  clearFilters() {
    this.filters = {
      user: '',
      status: '',
      category: '',
      client: '',
      visit: '',
      dateFrom: '',
      dateTo: '',
      amountMin: null,
      amountMax: null
    };

    this.applyFilters();
  }

  // ---------------- SORTING ----------------

  sortByDate() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

    this.filteredExpenses.sort((a: any, b: any) => {
      const dateA = new Date(a.expense_date).getTime();
      const dateB = new Date(b.expense_date).getTime();

      return this.sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    });
  }

  // ---------------- OPEN PREVIEW ----------------

  openPreview(exp: any) {
    this.expensesService.setSelectedExpense(exp);
    this.router.navigate(['/expense-preview']);
  }
}