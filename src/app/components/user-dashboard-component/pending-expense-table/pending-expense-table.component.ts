import { Input } from '@angular/core';
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

  private debounceTimer: any;


  constructor(private expensesService: ExpensesService, private authService: AuthServiceService, private router: Router) { }

  isAdmin: boolean = false;
  @Input() expenses: any[] = [];

  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.isAdmin = this.authService.userRole?.toLowerCase() === 'admin';
    // console.log("------------------------------Initialized------------------------------");
    if (this.isAdmin) {
      this.expensesService.fetchAdminPending().subscribe(res => {
        this.expenses = this.normalizeExpenses(res.data);
        this.applyFilters();
        console.log("Pending Table For Admin: ", res.data);
      });
    } else {


      this.expensesService.fetchEmployeePending().subscribe({
        next: (res) => {
          this.expenses = this.normalizeExpenses(res.data);
          this.applyFilters();
          console.log("Pending expense table content: ", this.expenses)
        },
        error: (err: string) => {
          console.log("Pending Expense error: ", err);
        }
      });

    }
    // this.expensesService.expenses.forEach((expense: any) => {
    //   console.log("Expense:", expense);
    // });
    // this.role = this.authService.userRole?.toLowerCase().trim() ?? '';
  }



  //-------------------------------------------Filters Logic------------------------------------
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



  onFilterChange() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }



  applyFilters() {
    const f = this.filters;

    this.filteredExpenses = this.expenses.filter(exp => {

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
        categoryMatch &&
        clientMatch &&
        visitMatch &&
        dateMatch &&
        amountMatch
      );
    });
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

    this.applyFilters();
  }




  getUnique(field: string) {
    return [...new Set(this.expenses.map(e => e[field]).filter(Boolean))];
  }














  status = 'Pending';
  firstClick = true;

  toggleStatus() {

    if (this.firstClick) {
      this.status = 'Approved';
      this.firstClick = false;
      return;
    }

    if (this.status === 'Approved') {
      this.status = 'Rejected';
    } else {
      this.status = 'Approved';
    }

  }

  // --------------------------------------------- Column Sorting -------------------------------------------------------------

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


  // get expenses() {
  //   return this.expensesService.expenses;
  // }

  // getPendingExpenses() {

  //   return this.expenses.filter((exp: any) =>
  //     exp.status.toLowerCase().trim() === 'Submitted'.toLowerCase().trim())

  // }


  // --------------------------------------------- OPEN PREVIEW -------------------------------------------------------------

  openPreview(exp: any) {
    this.expensesService.setSelectedExpense(exp);
    console.log("------------> This is the expense obj: ", exp);
    this.router.navigate(['/expense-preview']);
  }

}
