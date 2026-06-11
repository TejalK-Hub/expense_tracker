import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ExpensesService } from '../../../service/expenses.service';
import { AuthServiceService } from '../../../service/auth-service.service';

import { BackButtonComponent } from '../../back-button/back-button.component';
import { AddExpenseFormComponent } from '../../user-dashboard-component/add-expense-form/add-expense-form.component';


@Component({
  selector: 'app-expense-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    AddExpenseFormComponent,
    BackButtonComponent
  ],
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

  sortDirection: 'asc' | 'desc' = 'desc';
  isAdmin: boolean = false;

  private readonly FILTER_KEY = 'expense_table_filters_v1';
  private readonly SORT_KEY = 'expense_table_sort_v1';

  private debounceTimer: any;
  private queryParamsApplied = false;


  // ------------------------------------------------------ FILTER STATE ------------------------------------------------------
  filters = {
    user: '',
    userId: null as number | null,
    status: '',
    category: '',
    client: '',
    visit: '',
    dateFrom: '',
    dateTo: '',
    amountMin: null as number | null,
    amountMax: null as number | null
  };


  // ------------------------------------------------------ VISIT SEARCH ------------------------------------------------------
  visitSearch = '';
  filteredVisitsList: string[] = [];
  isVisitDropdownOpen = false;

  ngOnInit() {
    this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';

    this.loadFilters();
    this.loadSort();
    this.loadExpenses();
  }


  // ------------------------------------------------------ CREATE EXPENSE ------------------------------------------------------
  onExpenseCreated() {
    this.loadExpenses();

    const modalEl = document.getElementById('exampleModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }


  // ------------------------------------------------------ LOAD EXPENSES ------------------------------------------------------
  loadExpenses() {
    const request = this.isAdmin
      ? this.expensesService.fetchExpensesAdmin()
      : this.expensesService.fetchExpenses();

    request.subscribe(res => {
      console.log('Raw API Data:', res.data);

      this.expenses = this.removeDuplicateExpenses(
        this.normalizeExpenses(res.data)
      );

      console.log('After Dedup:', this.expenses);

      this.filteredVisitsList = this.getUnique('visit_name');

      this.applyQueryParamsOnce();
      this.applyFilters();
    });
  }


  // ------------------------------------------------------ QUERY PARAMS ------------------------------------------------------
  applyQueryParamsOnce() {
    if (this.queryParamsApplied) return;

    const params = this.route.snapshot.queryParams;
    const hasQueryParams = Object.keys(params).length > 0;

    if (hasQueryParams) {
      this.clearFilters();

      if ('status' in params) {
        this.filters.status = this.getUnique('status').find(s => s.toLowerCase() === params['status'].toLowerCase()) || '';
      }

      if ('dateFrom' in params) {
        this.filters.dateFrom = params['dateFrom'] || '';
      }

      if ('dateTo' in params) {
        this.filters.dateTo = params['dateTo'] || '';
      }

      if ('userId' in params) {
        this.filters.userId = Number(params['userId']);
      }

      if ('visit' in params) {
        this.filters.visit = params['visit'] || '';
        this.visitSearch = this.filters.visit;
      }

      this.saveFilters();
    }

    this.queryParamsApplied = true;
  }


  // ------------------------------------------------------ NORMALIZATION ------------------------------------------------------
  normalizeExpenses(data: any[]) {
    return data.map((e: any) => ({
      ...e,
      amount_value: this.extractAmount(e.amount)
    }));
  }

  extractAmount(amount: string): number {
    if (!amount) return 0;
    return parseFloat(amount.toString().replace(/[^\d.]/g, '')) || 0;
  }

  removeDuplicateExpenses(data: any[]) {
    const seen = new Set();

    return data.filter(exp => {
      const uniqueKey = `${exp.id}-${exp.expense_date}-${exp.amount}-${exp.user_id}`;

      if (seen.has(uniqueKey)) {
        return false;
      }

      seen.add(uniqueKey);
      return true;
    });
  }


  // ------------------------------------------------------ DISPLAY HELPERS ------------------------------------------------------
  getCategories(exp: any): string {
    return exp.expense_items?.map((i: any) => i.category).join(', ') || '';
  }

  getSelectedCategoryAmount(exp: any): number | null {
    if (!this.filters.category) {
      return null;
    }

    const item = exp.expense_items?.find(
      (i: any) => i.category === this.filters.category
    );

    return item ? Number(item.amount) : null;
  }

  isSelectedCategory(category: string): boolean {
    return this.filters.category === category;
  }


  getDisplayedTotal(): number {
    if (!this.filters.category) {
      return this.filteredExpenses.reduce(
        (sum, exp) => sum + (exp.amount_value || 0),
        0
      );
    }

    return this.filteredExpenses.reduce((sum, exp) => {

      const item = exp.expense_items?.find(
        (i: any) => i.category === this.filters.category
      );

      return sum + (Number(item?.amount) || 0);

    }, 0);
  }


  getUnique(field: string) {
    return [...new Set(this.expenses.map(e => e[field]).filter(Boolean))];
  }

  getUniqueCategories() {
    return [
      ...new Set(
        this.expenses.flatMap(exp =>
          exp.expense_items?.map((i: any) => i.category) || []
        )
      )
    ];
  }

  getUserNameById(id: number | null): string {
    if (!id) return '';

    const user = this.expenses.find(e => e.user_id === id);
    return user?.user_name || 'Unknown';
  }


  // ------------------------------------------------------ FILTER -------------------------------------------------------
  onFilterChange() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.saveFilters();
      this.applyFilters();
    }, 300);
  }

  hasActiveFilters(): boolean {
    const f = this.filters;

    return !!(
      f.user ||
      f.userId ||
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

  applyFilters() {
    const f = this.filters;

    console.log('Available statuses: ', this.getUnique('status'));
    this.filteredExpenses = this.expenses.filter(exp => {

      const userMatch =
        (!f.user && !f.userId) ||
        (!!f.userId && exp.user_id === f.userId) ||
        (!!f.user && exp.user_name === f.user);

      const statusMatch =
        !f.status ||
        exp.status?.toLowerCase() === f.status?.toLowerCase();

      const categoryMatch =
        !f.category ||
        exp.expense_items?.some(
          (item: any) => item.category === f.category
        );

      const clientMatch =
        !f.client ||
        exp.client_name === f.client;

      const visitMatch =
        !f.visit ||
        exp.visit_name === f.visit;

      const expenseDate = new Date(exp.expense_date).getTime();

      const dateMatch =
        (!f.dateFrom || expenseDate >= new Date(f.dateFrom).getTime()) &&
        (!f.dateTo || expenseDate <= new Date(f.dateTo).getTime());

      let amountToCheck = exp.amount_value;

      if (f.category) {
        const selectedItem = exp.expense_items?.find(
          (item: any) => item.category === f.category
        );

        amountToCheck = Number(selectedItem?.amount) || 0;
      }

      const amountMatch =
        (f.amountMin === null || amountToCheck >= f.amountMin) &&
        (f.amountMax === null || amountToCheck <= f.amountMax);

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
    console.log('Filtered expenses: ', this.filteredExpenses);
    this.applySorting();

  }

  clearFilters() {
    this.filters = {
      user: '',
      userId: null,
      status: '',
      category: '',
      client: '',
      visit: '',
      dateFrom: '',
      dateTo: '',
      amountMin: null,
      amountMax: null
    };

    this.visitSearch = '';

    localStorage.removeItem(this.FILTER_KEY);

    this.applyFilters();
  }

  removeFilter(type: string) {

    switch (type) {
      case 'user':
        this.filters.user = '';
        this.filters.userId = null;
        break;

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
        this.visitSearch = '';
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

  onUserChange(value: string) {
    this.filters.user = value;
    this.filters.userId = null;
    this.onFilterChange();
  }


  // ------------------------------------------------------ VISIT SEARCH ------------------------------------------------------
  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    const clickedInside = event.target.closest('.visit-dropdown');

    if (!clickedInside) {
      this.isVisitDropdownOpen = false;
    }
  }

  onVisitSearchChange() {
    const search = this.visitSearch.toLowerCase();

    this.filteredVisitsList = this.getUnique('visit_name').filter(v =>
      v.toLowerCase().includes(search)
    );
  }

  selectVisit(value: string) {
    this.filters.visit = value;
    this.visitSearch = value;
    this.isVisitDropdownOpen = false;
    this.onFilterChange();
  }


  // ------------------------------------------------------ LOCAL STORAGE ------------------------------------------------------
  saveFilters() {
    localStorage.setItem(this.FILTER_KEY, JSON.stringify(this.filters));
  }

  loadFilters() {
    const saved = localStorage.getItem(this.FILTER_KEY);
    console.log('Loading filters from localStorage: ', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        this.filters = {
          ...this.filters,
          ...parsed,
          amountMin: parsed.amountMin !== null ? Number(parsed.amountMin) : null,
          amountMax: parsed.amountMax !== null ? Number(parsed.amountMax) : null
        };

        this.visitSearch = this.filters.visit || '';
        console.log('Loaded filters: ', this.filters);
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
    this.sortDirection = saved || 'desc';
  }


  // ------------------------------------------------------ SORTING ------------------------------------------------------
  applySorting() {
    this.filteredExpenses.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return this.sortDirection === 'desc'
        ? dateB - dateA
        : dateA - dateB;
    });
  }

  sortByDate() {
    this.sortDirection =
      this.sortDirection === 'asc' ? 'desc' : 'asc';

    this.saveSort();
    this.applySorting();
  }


  // ------------------------------------------------------ NAVIGATION ------------------------------------------------------
  openPreview(exp: any, index: number) {
    this.expensesService.setPreviewContext(
      this.filteredExpenses,
      index
    );

    this.router.navigate(['/expense-preview']);
  }
}