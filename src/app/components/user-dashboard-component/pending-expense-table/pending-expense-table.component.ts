import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesService } from '../../../service/expenses.service';
import { AuthServiceService } from '../../../service/auth-service.service';


@Component({
  selector: 'app-pending-expense-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-expense-table.component.html',
  styleUrl: './pending-expense-table.component.scss'
})
export class PendingExpenseTableComponent implements OnInit {

  constructor(private expensesService: ExpensesService, private authService: AuthServiceService) { }

  role: string = '';
  ngOnInit() {
    // console.log("------------------------------Initialized------------------------------");
    this.expensesService.fetchExpense();
    this.expensesService.expenses.forEach((expense: any) => {
      console.log("Expense:", expense);
    });
    this.role = this.authService.userRole?.toLowerCase().trim() ?? '';
  }
  


  //-------------------------------------------Toggle Button Status------------------------------------
  // statusList = ['Pending', 'Approved', 'Rejected'];
  // crntIndx = 0;

  // status = this.statusList[this.crntIndx];

  // toggleStatus(){
  //   this.crntIndx = (this.crntIndx + 1) % this.statusList.length;
  //   this.status = this.statusList[this.crntIndx];
  // }



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


  get expenses() {
    return this.expensesService.expenses;
  }

  getPendingExpenses() {

    return this.expenses.filter((exp: any) =>
      exp.status.toLowerCase().trim() === 'Submitted'.toLowerCase().trim())

  }









































  // pendingExpenses = [
  //   {
  //     expense: 'Client Lunch',
  //     date: '2026-01-12',
  //     category: 'Meals & Ent.',
  //     receipt: 'lunch_0112.pdf',
  //     amount: 68.4,
  //     visit: 'Client A',
  //   },
  //   {
  //     expense: 'Uber Ride',
  //     date: '2026-01-13',
  //     category: 'Travel',
  //     receipt: 'uber_0113.png',
  //     amount: 24.75,
  //     visit: 'HQ Visit',
  //   },
  //   {
  //     expense: 'Hotel Stay',
  //     date: '2026-01-10',
  //     category: 'Accommodation',
  //     receipt: 'hotel_0110.pdf',
  //     amount: 312.0,
  //     visit: 'NYC Trip',
  //   },
  //   {
  //     expense: 'Office Supplies',
  //     date: '2026-01-09',
  //     category: 'Supplies',
  //     receipt: 'staples_0109.pdf',
  //     amount: 89.15,
  //     visit: '',
  //   },
  //   {
  //     expense: 'Flight Ticket',
  //     date: '2026-01-05',
  //     category: 'Travel',
  //     receipt: 'flight_0105.pdf',
  //     amount: 540.6,
  //     visit: 'SF Visit',
  //   },
  //   {
  //     expense: 'Team Dinner',
  //     date: '2026-01-14',
  //     category: 'Meals & Ent.',
  //     receipt: 'dinner_0114.jpg',
  //     amount: 156.9,
  //     visit: 'Team Meet',
  //   },
  //   {
  //     expense: 'Taxi Fare',
  //     date: '2026-01-08',
  //     category: 'Travel',
  //     receipt: 'taxi_0108.png',
  //     amount: 32.5,
  //     visit: 'Airport Run',
  //   },
  //   {
  //     expense: 'Conference Fee',
  //     date: '2026-01-02',
  //     category: 'Training',
  //     receipt: 'conf_0102.pdf',
  //     amount: 799.0,
  //     visit: 'TechConf',
  //   },
  // ];

}
