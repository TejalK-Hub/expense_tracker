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
  ) { }

  expenses: any[] = [];
  filteredExpenses: any[] = [];

  sortDirection!: 'asc' | 'desc';
  isAdmin: boolean = false;


  private readonly FILTER_KEY = 'expense_table_filters_v1';
  private readonly SORT_KEY = 'expense_table_sort_v1';

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

    this.loadFilters();
    this.loadSort();

    if (this.isAdmin) {

      this.expensesService.fetchExpenses().subscribe(res => {
        this.expenses = this.normalizeExpenses(res.data);
        this.applyQueryParamsOnce();
        this.applyFilters();
      });

    } else {

      this.expensesService.fetchExpense().subscribe(res => {
        this.expenses = this.normalizeExpenses(res.data);
        this.applyQueryParamsOnce();
        this.applyFilters();
      });

    }
  }

  applyQueryParamsOnce() {
    const params = this.route.snapshot.queryParams;

    const hasQueryParams = Object.keys(params).length > 0;

    if (hasQueryParams) {
      // ✅ RESET filters when coming from dashboard navigation
      this.clearFilters();

      // ✅ STATUS (explicit handling)
      if ('status' in params) {
        this.filters.status = params['status'] || '';
      }

      // ✅ DATE RANGE
      if ('dateFrom' in params) {
        this.filters.dateFrom = params['dateFrom'] || '';
      }

      if ('dateTo' in params) {
        this.filters.dateTo = params['dateTo'] || '';
      }

      this.saveFilters(); // persist new clean state
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
      this.saveFilters();
      this.applyFilters();
    }, 300);
  }

  // ---------------- FILTER LOGIC ----------------

  hasActiveFilters(): boolean {
    const f = this.filters;

    return !!(
      f.status ||
      f.category ||
      f.client ||
      f.visit ||
      f.dateFrom ||
      f.dateTo ||
      f.amountMin !== null ||
      f.amountMax !== null
    );
  }


  saveFilters() {
    localStorage.setItem(this.FILTER_KEY, JSON.stringify(this.filters));
  }

  loadFilters() {
    const saved = localStorage.getItem(this.FILTER_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        this.filters = {
          ...this.filters,
          ...parsed,
          amountMin: parsed.amountMin !== null ? Number(parsed.amountMin) : null,
          amountMax: parsed.amountMax !== null ? Number(parsed.amountMax) : null
        };

      } catch {
        this.clearFilters();
      }
    }
  }

  saveSort() {
    localStorage.setItem(this.SORT_KEY, this.sortDirection);
  }

  loadSort() {
    const saved = localStorage.getItem(this.SORT_KEY) as 'asc' | 'desc' | null;
    this.sortDirection = saved || 'asc';
  }



  applyFilters() {
    const f = this.filters;

    this.filteredExpenses = this.expenses.filter(exp => {

      const userMatch =
        !f.user || exp.user_name === f.user;

      const statusMatch =
        !f.status || exp.status?.toLowerCase() === f.status?.toLowerCase();

      const categoryMatch =
        !f.category || exp.category === f.category;

      const clientMatch =
        !f.client || exp.client_name === f.client;

      const visitMatch =
        !f.visit || exp.visit_name === f.visit;

      const expenseDate = new Date(exp.expense_date).getTime();

      const dateMatch =
        (!f.dateFrom || expenseDate >= new Date(f.dateFrom).getTime()) &&
        (!f.dateTo || expenseDate <= new Date(f.dateTo).getTime());

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
    this.applySorting();
  }


  applySorting() {
    this.filteredExpenses.sort((a: any, b: any) => {
      const dateA = new Date(a.expense_date).getTime();
      const dateB = new Date(b.expense_date).getTime();

      return this.sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
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
    localStorage.removeItem(this.FILTER_KEY);
    this.applyFilters();
  }



  removeFilter(type: string) {

    switch (type) {
      case 'status':
        this.filters.status = '';
        break;

      case 'category':
        this.filters.category = '';
        break;

      case 'client':
        this.filters.client = '';
        break;

      case 'visit':
        this.filters.visit = '';
        break;

      case 'date':
        this.filters.dateFrom = '';
        this.filters.dateTo = '';
        break;

      case 'amount':
        this.filters.amountMin = null;
        this.filters.amountMax = null;
        break;
    }

    this.saveFilters();
    this.applyFilters();
  }

  // ---------------- SORTING ----------------

  sortByDate() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.saveSort();     // 👈 persist sort
    this.applySorting();
  }

  // ---------------- OPEN PREVIEW ----------------

  openPreview(exp: any) {
    this.expensesService.setSelectedExpense(exp);
    this.router.navigate(['/expense-preview']);
  }
}