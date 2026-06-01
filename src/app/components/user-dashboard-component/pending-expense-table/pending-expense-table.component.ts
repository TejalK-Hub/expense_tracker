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
    user: '',
    userId: null as number | null,
    category: '',
    client: '',
    visit: '',
    dateFrom: '',
    dateTo: '',
    amountMin: null as number | null,
    amountMax: null as number | null
  };

  categoryList: string[] = [];
  category: string = '';
  clientList: string[] = [];

  // ===== VISIT SEARCH DROPDOWN STATE =====
  visitSearch = '';
  filteredVisitsList: string[] = [];
  isVisitDropdownOpen = false;

  private debounceTimer: any;
  private readonly FILTER_KEY = 'pending_expense_filters_v1';
  private readonly SORT_KEY = 'pending_expense_sort_v1';

  constructor(
    private expensesService: ExpensesService,
    private authService: AuthServiceService,
    private router: Router
  ) { }

  isAdmin: boolean = false;
  @Input() expenses: any[] = [];

  sortDirection: 'asc' | 'desc' = 'asc';

  // ngOnInit() {
  //   this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';

  //   this.loadFilters();
  //   this.filteredVisitsList = this.getUnique('visit_name');
  //   console.log("Unique visits: ", this.filteredVisitsList);


  //   if (this.isAdmin) {
  //     this.expensesService.fetchAdminPending().subscribe(res => {
  //       console.log("Admin pending expenses response: ", res);
  //       this.expenses = this.normalizeExpenses(res.data);
  //       this.filteredVisitsList = this.getUnique('visit_name');
  //       this.applyFilters();
  //     });
  //   } else {
  //     this.expensesService.fetchEmployeePending().subscribe({
  //       next: (res) => {
  //         console.log("Employee pending expenses response: ++++++++++++++++++++++++++++++++++++++++++++++++++++ ", res.data);
  //         this.expenses = this.normalizeExpenses(res.data);
  //         this.categoryList = [...new Set(this.expenses.flatMap(e => e.category_list))];
  //         this.clientList = this.getUnique('client_name');
  //         this.filteredVisitsList = this.getUnique('visit_name');
  //         this.applyFilters();
  //       },
  //       error: (err: string) => {
  //         console.log("Pending Expense error: ", err);
  //       }
  //     });
  //   }
  // }

  ngOnInit() {
    this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';

    this.loadFilters();
    this.loadSort();

    if (this.isAdmin) {
      this.expensesService.fetchAdminPending().subscribe(res => {
        this.onExpensesLoaded(res.data);
      });
    } else {
      this.expensesService.fetchEmployeePending().subscribe({
        next: (res) => this.onExpensesLoaded(res.data),
        error: (err) => console.log("Pending Expense error: ", err)
      });
    }
  }


  private onExpensesLoaded(data: any[]) {
    this.expenses = this.normalizeExpenses(data);

    // this.categoryList = this.getUniqueCategories();
    this.categoryList = this.getUnique('category_list');
    this.filteredVisitsList = this.getUnique('visit_name');
    this.clientList = this.getUnique('client_name');
    // this.filteredVisitsList = this.getUnique('visit_name');
    this.visitSearch = this.filters.visit || '';

    this.applyFilters();
  }

  // ---------------- FILTER STORAGE ----------------

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


  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    const clickedInside = event.target.closest('.visit-dropdown');
    if (!clickedInside) {
      this.isVisitDropdownOpen = false;
    }
  }

  // ---------------- NORMALIZE ----------------

  // normalizeExpenses(data: any[]) {
  //   return data.map((e: any) => ({
  //     ...e,
  //     amount_value: this.extractAmount(e.amount)
  //   }));
  // }


  normalizeExpenses(data: any[]) {
    return data.map((e: any) => {
      const items = e.expense_items || [];

      const categories = items
        .map((i: any) => i.category)
        .filter(Boolean);

      const categoryMap: Record<string, number> = {};

      for (const item of items) {
        const cat = item.category;
        const amt = this.extractAmount(item.amount || e.amount);

        if (!categoryMap[cat]) {
          categoryMap[cat] = 0;
        }
        categoryMap[cat] += amt;
      }

      return {
        ...e,

        category_list: [...new Set(categories)],
        category: [...new Set(categories)].join(', '),

        category_amount_map: categoryMap,   // 🔥 NEW

        amount_value: this.extractAmount(e.amount)
      };
    });
  }

  extractAmount(amount: string): number {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
  }

  getSelectedCategoryAmount(exp: any): number | null {

    if (!this.filters.category) {
      return null;
    }

    return exp.category_amount_map?.[this.filters.category] ?? null;
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

      return (
        sum +
        (exp.category_amount_map?.[this.filters.category] || 0)
      );

    }, 0);
  }

  getUserNameById(id: number | null): string {

    if (!id) {
      return '';
    }

    const user = this.expenses.find(
      e => e.user_id === id
    );

    return user?.user_name || 'Unknown';
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

      const userMatch =
        (!f.user && !f.userId) ||
        (!!f.userId && exp.user_id === f.userId) ||
        (!!f.user && exp.user_name === f.user);

      const categoryMatch =
        !f.category ||
        exp.category_list?.includes(f.category);

      const clientMatch =
        !f.client ||
        exp.client_name === f.client;

      const visitMatch =
        !f.visit ||
        exp.visit_name === f.visit;

      const expenseDate =
        new Date(exp.expense_date).getTime();

      const dateMatch =
        (!f.dateFrom ||
          expenseDate >= new Date(f.dateFrom).getTime()) &&
        (!f.dateTo ||
          expenseDate <= new Date(f.dateTo).getTime());

      let amountToCheck = exp.amount_value;

      if (f.category) {
        amountToCheck =
          exp.category_amount_map?.[f.category] || 0;
      }

      const amountMatch =
        (f.amountMin === null ||
          amountToCheck >= f.amountMin) &&
        (f.amountMax === null ||
          amountToCheck <= f.amountMax);

      const selectedCategoryAmount =
        f.category && exp.category_amount_map
          ? exp.category_amount_map[f.category] || 0
          : 0;

      const include =
        userMatch &&
        categoryMatch &&
        clientMatch &&
        visitMatch &&
        dateMatch &&
        amountMatch;

      if (!include) {
        return false;
      }

      exp.selected_category_amount =
        selectedCategoryAmount;

      return true;
    });

    this.applySorting();
  }


  saveSort() {
    localStorage.setItem(this.SORT_KEY, this.sortDirection);
  }

  loadSort() {
    const saved = localStorage.getItem(this.SORT_KEY) as 'asc' | 'desc' | null;
    this.sortDirection = saved || 'asc';
  }
  // ---------------- ACTIVE FILTERS ----------------

  hasActiveFilters(): boolean {

    const f = this.filters;

    return !!(
      f.user ||
      f.userId ||
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

      case 'user':
        this.filters.user = '';
        this.filters.userId = null;
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

  clearFilters() {
    this.filters = {
      user: '',
      userId: null,
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
    this.saveFilters();
    this.applyFilters();
  }

  // ---------------- UTIL ----------------

  getUnique(field: string) {
    return [
      ...new Set(
        this.expenses.flatMap(e =>
          Array.isArray(e[field]) ? e[field] : [e[field]]
        ).filter(Boolean)
      )
    ];
  }

  onUserChange(value: string) {
    this.filters.user = value;
    this.filters.userId = null;
    this.onFilterChange();
  }

  // ---------------- SORTING ----------------

  applySorting() {

    this.filteredExpenses.sort((a: any, b: any) => {

      const dateA =
        new Date(a.created_at).getTime();

      const dateB =
        new Date(b.created_at).getTime();

      return this.sortDirection === 'desc'
        ? dateB - dateA
        : dateA - dateB;
    });
  }

  sortByDate() {

    this.sortDirection =
      this.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    this.saveSort();
    this.applySorting();
  }

  // ---------------- PREVIEW ----------------

  // openPreview(exp: any) {
  //   this.expensesService.setSelectedExpense(exp);
  //   console.log("------------> This is the expense obj: ", exp);
  //   this.router.navigate(['/expense-preview']);
  // }


  openPreview(exp: any) {

    const index = this.filteredExpenses.findIndex(
      e => e.id === exp.id
    );

    this.expensesService.setPreviewContext(
      this.filteredExpenses,
      index
    );

    console.log("Selected index:", index);
    console.log("Selected expense:", exp);

    this.router.navigate(['/expense-preview']);
  }
}