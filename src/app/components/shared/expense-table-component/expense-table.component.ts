// import { CommonModule } from '@angular/common';
// import { Component, HostListener, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ExpensesService } from '../../../service/expenses.service';
// import { BackButtonComponent } from '../../back-button/back-button.component';
// import { AuthServiceService } from '../../../service/auth-service.service';
// import { AddExpenseFormComponent } from '../../user-dashboard-component/add-expense-form/add-expense-form.component';

// @Component({
//   selector: 'app-expense-table',
//   standalone: true,
//   imports: [CommonModule, FormsModule, AddExpenseFormComponent, BackButtonComponent],
//   templateUrl: './expense-table.component.html',
//   styleUrl: './expense-table.component.scss',
// })
// export class ExpenseTableComponent implements OnInit {

//   constructor(
//     private authService: AuthServiceService,
//     private expensesService: ExpensesService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) { }

//   expenses: any[] = [];
//   filteredExpenses: any[] = [];

//   sortDirection!: 'asc' | 'desc';
//   isAdmin: boolean = false;


//   private readonly FILTER_KEY = 'expense_table_filters_v1';
//   private readonly SORT_KEY = 'expense_table_sort_v1';

//   private debounceTimer: any;

//   // ---------------- FILTER STATE ----------------

//   filters = {
//     user: '',
//     userId: null as number | null,
//     status: '',
//     category: '',
//     client: '',
//     visit: '',
//     dateFrom: '',
//     dateTo: '',
//     amountMin: null as number | null,
//     amountMax: null as number | null
//   };

//   // ===== VISIT SEARCH DROPDOWN =====
//   visitSearch = '';
//   filteredVisitsList: string[] = [];
//   isVisitDropdownOpen = false;



//   ngOnInit() {

//     this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';

//     this.loadFilters();
//     this.loadSort();

//     this.loadExpenses();
//   }


//   // ---------------- CREATE EXPENSE ----------------
//   onExpenseCreated() {
//     this.loadExpenses();

//     // close modal manually
//     const modalEl = document.getElementById('exampleModal');
//     if (modalEl) {
//       const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
//       modal?.hide();
//     }
//   }





//   applyQueryParamsOnce() {
//     const params = this.route.snapshot.queryParams;

//     const hasQueryParams = Object.keys(params).length > 0;

//     if (hasQueryParams) {
//       // ✅ RESET filters when coming from dashboard navigation
//       this.clearFilters();

//       // ✅ STATUS (explicit handling)
//       if ('status' in params) {
//         this.filters.status = params['status'] || '';
//       }

//       // ✅ DATE RANGE
//       if ('dateFrom' in params) {
//         this.filters.dateFrom = params['dateFrom'] || '';
//       }

//       if ('dateTo' in params) {
//         this.filters.dateTo = params['dateTo'] || '';
//       }

//       if ('userId' in params) {
//         this.filters.userId = Number(params['userId']);
//       }

//       if ('visit' in params) {
//         this.filters.visit = params['visit'] || '';
//         this.visitSearch = this.filters.visit;
//         console.log('Applying visit filter from query params: ', this.filters.visit);
//       }

//       this.saveFilters(); // persist new clean state
//     }
//   }


//   // ---------------- NORMALIZE DATA ----------------

//   normalizeExpenses(data: any[]) {
//     return data.map((e: any) => ({
//       ...e,
//       amount_value: this.extractAmount(e.amount)
//     }));
//   }

//   extractAmount(amount: string): number {
//     if (!amount) return 0;
//     return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
//   }

//   // ---------------- UNIQUE VALUES ----------------

//   getUnique(field: string) {
//     return [...new Set(this.expenses.map(e => e[field]).filter(Boolean))];
//   }

//   // ---------------- DEBOUNCED FILTER APPLY ----------------

//   onFilterChange() {
//     clearTimeout(this.debounceTimer);

//     this.debounceTimer = setTimeout(() => {
//       this.saveFilters();
//       this.applyFilters();
//     }, 300);
//   }

//   // ---------------- FILTER LOGIC ----------------

//   hasActiveFilters(): boolean {
//     const f = this.filters;
//     // console.log('Checking active filters: ', f);
//     return !!(
//       f.user ||
//       f.status ||
//       f.category ||
//       f.client ||
//       f.visit ||
//       f.dateFrom ||
//       f.dateTo ||
//       f.amountMin !== null ||
//       f.amountMax !== null
//     );
//   }


//   saveFilters() {
//     localStorage.setItem(this.FILTER_KEY, JSON.stringify(this.filters));
//   }

//   loadFilters() {
//     const saved = localStorage.getItem(this.FILTER_KEY);

//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);

//         this.filters = {
//           ...this.filters,
//           ...parsed,
//           amountMin: parsed.amountMin !== null ? Number(parsed.amountMin) : null,
//           amountMax: parsed.amountMax !== null ? Number(parsed.amountMax) : null
//         };
//         this.visitSearch = this.filters.visit || '';
//       } catch {
//         this.clearFilters();
//       }
//     }
//   }


//   //---------------- visit search ----------------

//   @HostListener('document:click', ['$event'])
//   onClickOutside(event: any) {
//     const clickedInside = event.target.closest('.visit-dropdown');
//     if (!clickedInside) {
//       this.isVisitDropdownOpen = false;
//     }
//   }



//   onVisitSearchChange() {
//     const search = this.visitSearch.toLowerCase();

//     this.filteredVisitsList = this.getUnique('visit_name').filter(v =>
//       v.toLowerCase().includes(search)
//     );
//   }

//   selectVisit(value: string) {
//     this.filters.visit = value;
//     this.visitSearch = value;
//     this.isVisitDropdownOpen = false;
//     this.onFilterChange();
//   }


//   saveSort() {
//     localStorage.setItem(this.SORT_KEY, this.sortDirection);
//   }

//   loadSort() {
//     const saved = localStorage.getItem(this.SORT_KEY) as 'asc' | 'desc' | null;
//     this.sortDirection = saved || 'asc';
//   }

//   getUserNameById(id: number | null): string {
//     if (!id) return '';

//     const user = this.expenses.find(e => e.user_id === id);
//     return user?.user_name || 'Unknown';
//   }

//   applyFilters() {
//     const f = this.filters;

//     this.filteredExpenses = this.expenses.filter(exp => {

//       const userMatch =
//         (!f.user && !f.userId) ||
//         (f.userId && exp.user_id === f.userId) ||
//         (f.user && exp.user_name === f.user);

//       const statusMatch =
//         !f.status || exp.status?.toLowerCase() === f.status?.toLowerCase();

//       const categoryMatch =
//         !f.category || exp.category === f.category;

//       const clientMatch =
//         !f.client || exp.client_name === f.client;

//       const visitMatch =
//         !f.visit || exp.visit_name === f.visit;

//       const expenseDate = new Date(exp.expense_date).getTime();

//       const dateMatch =
//         (!f.dateFrom || expenseDate >= new Date(f.dateFrom).getTime()) &&
//         (!f.dateTo || expenseDate <= new Date(f.dateTo).getTime());

//       const amountMatch =
//         (f.amountMin === null || exp.amount_value >= f.amountMin) &&
//         (f.amountMax === null || exp.amount_value <= f.amountMax);

//       return (
//         userMatch &&
//         statusMatch &&
//         categoryMatch &&
//         clientMatch &&
//         visitMatch &&
//         dateMatch &&
//         amountMatch
//       );
//     });
//     this.applySorting();
//   }

//   onUserChange(value: string) {
//     // this.clearFilters();        // step 1: clear everything
//     this.filters.user = value;  // step 2: set new value
//     // this.applyFilters();
//     this.onFilterChange();
//   }


//   loadExpenses() {
//     if (this.isAdmin) {
//       this.expensesService.fetchExpenses().subscribe(res => {
//         console.log('Fetched expenses: ', res.data);
//         this.expenses = this.normalizeExpenses(res.data);
//         this.filteredVisitsList = this.getUnique('visit_name');
//         this.applyQueryParamsOnce();
//         this.applyFilters();
//         console.log('Load expenses: ', this.filteredExpenses);
//       });
//     } else {
//       this.expensesService.fetchExpense().subscribe(res => {
//         this.expenses = this.normalizeExpenses(res.data);
//         this.filteredVisitsList = this.getUnique('visit_name');
//         this.applyQueryParamsOnce();
//         this.applyFilters();
//       });
//     }
//   }

//   applySorting() {
//     this.filteredExpenses.sort((a: any, b: any) => {
//       const dateA = new Date(a.created_at).getTime();
//       const dateB = new Date(b.created_at).getTime();
//       console.log('Applying sorting: ', this.filteredExpenses);

//       return this.sortDirection === 'desc'
//         ? dateA - dateB
//         : dateB - dateA;
//     });
//   }

//   // ---------------- CLEAR FILTERS ----------------

//   clearFilters() {
//     this.filters = {
//       user: '',
//       userId: null,
//       status: '',
//       category: '',
//       client: '',
//       visit: '',
//       dateFrom: '',
//       dateTo: '',
//       amountMin: null,
//       amountMax: null
//     };
//     this.visitSearch = '';
//     localStorage.removeItem(this.FILTER_KEY);
//     this.applyFilters();
//   }



//   removeFilter(type: string) {

//     switch (type) {
//       case 'user':
//         this.filters.user = '';
//         this.filters.userId = null;
//         break;

//       case 'status':
//         this.filters.status = '';
//         break;

//       case 'category':
//         this.filters.category = '';
//         break;

//       case 'client':
//         this.filters.client = '';
//         break;

//       case 'visit':
//         this.filters.visit = '';
//         break;

//       case 'date':
//         this.filters.dateFrom = '';
//         this.filters.dateTo = '';
//         break;

//       case 'amount':
//         this.filters.amountMin = null;
//         this.filters.amountMax = null;
//         break;
//     }

//     this.saveFilters();
//     this.applyFilters();
//   }

//   // ---------------- SORTING ----------------

//   sortByDate() {
//     this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
//     this.saveSort();     // 👈 persist sort
//     this.applySorting();
//   }

//   // ---------------- OPEN PREVIEW ----------------

//   openPreview(exp: any) {
//     this.expensesService.setSelectedExpense(exp);
//     this.router.navigate(['/expense-preview']);
//   }
// }

import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpensesService } from '../../../service/expenses.service';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { AuthServiceService } from '../../../service/auth-service.service';
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

  // ---------------- FILTER STATE ----------------
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

  // ---------------- VISIT SEARCH ----------------
  visitSearch = '';
  filteredVisitsList: string[] = [];
  isVisitDropdownOpen = false;

  ngOnInit() {
    this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';

    this.loadFilters();
    this.loadSort();
    this.loadExpenses();
  }

  // ---------------- CREATE EXPENSE ----------------
  onExpenseCreated() {
    this.loadExpenses();

    const modalEl = document.getElementById('exampleModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }

  // ---------------- QUERY PARAMS ----------------
  applyQueryParamsOnce() {
    if (this.queryParamsApplied) return;

    const params = this.route.snapshot.queryParams;
    const hasQueryParams = Object.keys(params).length > 0;

    if (hasQueryParams) {
      this.clearFilters();

      if ('status' in params) {
        console.log(params['status'], "jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
        // this.filters.status = params['status'] || '';
        this.filters.status = this.getUnique('status').find(s => s.toLowerCase() === params['status'].toLowerCase()) || '';
        // this.filters.status =
        //   this.getUnique('status').find(
        //     s => s.toLowerCase() === params['status']?.toLowerCase()
        //   ) || '';
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

  // ---------------- NORMALIZE ----------------
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

  // ---------------- REMOVE DUPLICATES ----------------
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

  // ---------------- UNIQUE VALUES ----------------
  getUnique(field: string) {
    return [...new Set(this.expenses.map(e => e[field]).filter(Boolean))];
  }

  // ---------------- FILTER CHANGES ----------------
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

  // ---------------- LOCAL STORAGE ----------------
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

        this.visitSearch = this.filters.visit || '';
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

  // ---------------- VISIT SEARCH ----------------
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

  // ---------------- USER ----------------
  onUserChange(value: string) {
    this.filters.user = value;
    this.filters.userId = null;
    this.onFilterChange();
  }

  getUserNameById(id: number | null): string {
    if (!id) return '';

    const user = this.expenses.find(e => e.user_id === id);
    return user?.user_name || 'Unknown';
  }

  // ---------------- FILTER LOGIC ----------------
  applyFilters() {
    const f = this.filters;

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
        exp.category === f.category;

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

  // ---------------- LOAD EXPENSES ----------------
  loadExpenses() {
    const request = this.isAdmin
      ? this.expensesService.fetchExpenses()
      : this.expensesService.fetchExpense();

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

  // ---------------- SORT ----------------
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

  // ---------------- CLEAR ----------------
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

  // ---------------- PREVIEW ----------------
  openPreview(exp: any) {
    this.expensesService.setSelectedExpense(exp);
    this.router.navigate(['/expense-preview']);
  }
}