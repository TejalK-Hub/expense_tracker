import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(
    private httpClient: HttpClient,
    private auth: AuthServiceService,
  ) {}

  // expenses = [
  //   {
  //     expense: 'Client Lunch',
  //     date: '2026-01-12',
  //     category: 'Meals & Ent.',
  //     receipt: 'lunch_0112.pdf',
  //     receiptNo: 'RCPT-1001',
  //     description: 'Lunch with client',
  //     amount: 68.4,
  //     status: 'Approved',
  //     approvedBy: 'J. Smith',
  //     approvedAt: '2026-01-12T14:30:00',
  //     visit: 'Client A',
  //   },
  //   {
  //     expense: 'Uber Ride',
  //     date: '2026-01-13',
  //     category: 'Travel',
  //     receipt: 'uber_0113.png',
  //     receiptNo: 'RCPT-1002',
  //     description: 'Ride to HQ',
  //     amount: 24.75,
  //     status: 'Pending',
  //     approvedBy: '',
  //     approvedAt: null,
  //     visit: 'HQ Visit',
  //   },
  //   {
  //     expense: 'Hotel Stay',
  //     date: '2026-01-10',
  //     category: 'Accommodation',
  //     receipt: 'hotel_0110.pdf',
  //     receiptNo: 'RCPT-1003',
  //     description: '1-night stay',
  //     amount: 312.0,
  //     status: 'Approved',
  //     approvedBy: 'M. Chen',
  //     approvedAt: '2026-01-10T18:45:00',
  //     visit: 'NYC Trip',
  //   },
  //   {
  //     expense: 'Office Supplies',
  //     date: '2026-01-09',
  //     category: 'Supplies',
  //     receipt: 'staples_0109.pdf',
  //     receiptNo: 'RCPT-1004',
  //     description: 'Stationery purchase',
  //     amount: 89.15,
  //     status: 'Rejected',
  //     approvedBy: 'A. Patel',
  //     approvedAt: '2026-01-09T11:20:00',
  //     visit: '',
  //   },
  //   {
  //     expense: 'Flight Ticket',
  //     date: '2026-01-05',
  //     category: 'Travel',
  //     receipt: 'flight_0105.pdf',
  //     receiptNo: 'RCPT-1005',
  //     description: 'Flight booking',
  //     amount: 540.6,
  //     status: 'Approved',
  //     approvedBy: 'J. Smith',
  //     approvedAt: '2026-01-05T09:10:00',
  //     visit: 'SF Visit',
  //   },
  //   {
  //     expense: 'Team Dinner',
  //     date: '2026-01-14',
  //     category: 'Meals & Ent.',
  //     receipt: 'dinner_0114.jpg',
  //     receiptNo: 'RCPT-1006',
  //     description: 'Dinner outing',
  //     amount: 156.9,
  //     status: 'Pending',
  //     approvedBy: '',
  //     approvedAt: null,
  //     visit: 'Team Meet',
  //   },
  //   {
  //     expense: 'Taxi Fare',
  //     date: '2026-01-08',
  //     category: 'Travel',
  //     receipt: 'taxi_0108.png',
  //     receiptNo: 'RCPT-1007',
  //     description: 'Local taxi',
  //     amount: 32.5,
  //     status: 'Approved',
  //     approvedBy: 'M. Chen',
  //     approvedAt: '2026-01-08T16:05:00',
  //     visit: 'Airport Run',
  //   },
  //   {
  //     expense: 'Conference Fee',
  //     date: '2026-01-02',
  //     category: 'Training',
  //     receipt: 'conf_0102.pdf',
  //     receiptNo: 'RCPT-1008',
  //     description: 'Event fee',
  //     amount: 799.0,
  //     status: 'Approved',
  //     approvedBy: 'A. Patel',
  //     approvedAt: '2026-01-02T13:55:00',
  //     visit: 'TechConf',
  //   },
  // ];


  expenses: any[] = [];


  fetchExpense() {
    console.log('Fetching expenses for user ID:', this.auth.userId);
    var fetchedExpen = this.httpClient
      .post(
        `http://localhost:5001/expenses/user?user_id=${this.auth.userId}`,
        {},
        { headers: { Authorization: `Bearer ${this.auth.getToken()}` } },
      )
      .subscribe((res) => {
        console.log('Fetched expenses:', res);
        return res;
      });
    console.log("This is triggered:", fetchedExpen);
  }

  selectedExpense: any = null;

  setSelectedExpense(expense: any) {
    this.selectedExpense = expense;
  }

  getSelectedExpense() {
    return this.selectedExpense;
  }

  addExpense(expense: any) {
    // this.expenses.push({
    //   ...expense,
    //   status: 'Pending',
    //   approvedBy: null,
    //   approvedAt: null
    // });

    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IkVtcGxveWVlIiwiaWF0IjoxNzcyNDU2NzI2LCJleHAiOjE3NzI1NDMxMjZ9.N8_Fu3fnpwuWVd3Mi12HxleP8sF-HHyPYmuZWFDjIYQ';

    // const token = this.auth.getToken();
    console.log('Using token:', token);
    const headers = { Authorization: `Bearer ${token}` };

    return this.httpClient.post('http://192.168.0.105:5001/expenses', expense, { headers });
    // return this.httpClient.post('http://localhost:5001/expenses', expense, { headers });
  }
}
