import { HostListener, Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesService } from '../../../service/expenses.service';
import { AuthServiceService } from '../../../service/auth-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pending-expense-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-expense-table.component.html',
  styleUrl: './pending-expense-table.component.scss'
})
export class PendingExpenseTableComponent implements OnInit {

  filteredExpenses: any[] = [];

  filters = {
    category: '',
    client: '',
    visit: '',
    dateFrom: '',
    dateTo: '',
    amountMin: null as number | null,
    amountMax: null as number | null
  };


  // ===== VISIT SEARCH DROPDOWN STATE =====
  visitSearch = '';
  filteredVisitsList: string[] = [];
  isVisitDropdownOpen = false;

  private debounceTimer: any;
  private readonly FILTER_KEY = 'pending_expense_filters_v1';

  constructor(
    private expensesService: ExpensesService,
    private authService: AuthServiceService,
    private router: Router
  ) { }

  isAdmin: boolean = false;
  @Input() expenses: any[] = [];

  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';

    this.filteredVisitsList = this.getUnique('visit_name');
    console.log("Unique visits: ", this.filteredVisitsList);

    this.loadFilters();

    if (this.isAdmin) {
      this.expensesService.fetchAdminPending().subscribe(res => {
        this.expenses = this.normalizeExpenses(res.data);
        this.filteredVisitsList = this.getUnique('visit_name'); 
        this.applyFilters();
      });
    } else {
      this.expensesService.fetchEmployeePending().subscribe({
        next: (res) => {
          this.expenses = this.normalizeExpenses(res.data);
          this.filteredVisitsList = this.getUnique('visit_name'); 
          this.applyFilters();
        },
        error: (err: string) => {
          console.log("Pending Expense error: ", err);
        }
      });
    }
  }

  // ---------------- FILTER STORAGE ----------------

  saveFilters() {
    localStorage.setItem(this.FILTER_KEY, JSON.stringify(this.filters));
  }

  loadFilters() {
    const saved = localStorage.getItem(this.FILTER_KEY);

    this.filteredVisitsList = this.getUnique('visit_name'); 
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        this.filters = {
          ...this.filters,
          ...parsed,
          amountMin: parsed.amountMin !== null ? Number(parsed.amountMin) : null,
          amountMax: parsed.amountMax !== null ? Number(parsed.amountMax) : null
        };

        // this.visitSearch = this.filters.visit || '';

      } catch {
        this.clearFilters();
      }
    }
  }


  // ---------------- VISIT SEARCH ----------------
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


  // @HostListener('document:click', ['$event'])
  // onClickOutside(event: any) {
  //   const clickedInside = event.target.closest('.visit-dropdown');
  //   if (!clickedInside) {
  //     this.isVisitDropdownOpen = false;
  //   }
  // }

  // ---------------- NORMALIZE ----------------

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

  // ---------------- FILTER CHANGE ----------------

  onFilterChange() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.saveFilters();
      this.applyFilters();
    }, 300);
  }

  // ---------------- FILTER LOGIC ----------------

  applyFilters() {
    const f = this.filters;

    this.filteredExpenses = this.expenses.filter(exp => {

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
        categoryMatch &&
        clientMatch &&
        visitMatch &&
        dateMatch &&
        amountMatch
      );
    });
  }

  // ---------------- ACTIVE FILTERS ----------------

  hasActiveFilters(): boolean {
    const f = this.filters;

    return !!(
      f.category ||
      f.client ||
      f.visit ||
      f.dateFrom ||
      f.dateTo ||
      f.amountMin !== null ||
      f.amountMax !== null
    );
  }

  removeFilter(type: string) {

    switch (type) {
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

  clearFilters() {
    this.filters = {
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

  // ---------------- UTIL ----------------

  getUnique(field: string) {
    console.log("Unique values for " + field + ": ", [...new Set(this.expenses.map(e => e[field]))]);
    return [...new Set(this.expenses.map(e => e[field]).filter(Boolean))];
  }

  // ---------------- SORTING ----------------

  sortByDate() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

    this.filteredExpenses.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return this.sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    });
  }

  // ---------------- PREVIEW ----------------

  openPreview(exp: any) {
    this.expensesService.setSelectedExpense(exp);
    console.log("------------> This is the expense obj: ", exp);
    this.router.navigate(['/expense-preview']);
  }
}