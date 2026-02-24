import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-expense-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-table.component.html',
  styleUrl: './expense-table.component.scss'
})
export class ExpenseTableComponent {

  expenses = [
    {
      expense: 'Client Lunch',
      date: '2026-01-12',
      category: 'Meals & Ent.',
      receipt: 'lunch_0112.pdf',
      amount: 68.4,
      status: 'Approved',
      approvedBy: 'J. Smith',
      flag: 'No',
      visit: 'Client A',
    },
    {
      expense: 'Uber Ride',
      date: '2026-01-13',
      category: 'Travel',
      receipt: 'uber_0113.png',
      amount: 24.75,
      status: 'Pending',
      approvedBy: '',
      flag: 'No',
      visit: 'HQ Visit',
    },
    {
      expense: 'Hotel Stay',
      date: '2026-01-10',
      category: 'Accommodation',
      receipt: 'hotel_0110.pdf',
      amount: 312.0,
      status: 'Approved',
      approvedBy: 'M. Chen',
      flag: 'No',
      visit: 'NYC Trip',
    },
    {
      expense: 'Office Supplies',
      date: '2026-01-09',
      category: 'Supplies',
      receipt: 'staples_0109.pdf',
      amount: 89.15,
      status: 'Rejected',
      approvedBy: 'A. Patel',
      flag: 'Yes',
      visit: '',
    },
    {
      expense: 'Flight Ticket',
      date: '2026-01-05',
      category: 'Travel',
      receipt: 'flight_0105.pdf',
      amount: 540.6,
      status: 'Approved',
      approvedBy: 'J. Smith',
      flag: 'No',
      visit: 'SF Visit',
    },
    {
      expense: 'Team Dinner',
      date: '2026-01-14',
      category: 'Meals & Ent.',
      receipt: 'dinner_0114.jpg',
      amount: 156.9,
      status: 'Pending',
      approvedBy: '',
      flag: 'No',
      visit: 'Team Meet',
    },
    {
      expense: 'Taxi Fare',
      date: '2026-01-08',
      category: 'Travel',
      receipt: 'taxi_0108.png',
      amount: 32.5,
      status: 'Approved',
      approvedBy: 'M. Chen',
      flag: 'No',
      visit: 'Airport Run',
    },
    {
      expense: 'Conference Fee',
      date: '2026-01-02',
      category: 'Training',
      receipt: 'conf_0102.pdf',
      amount: 799.0,
      status: 'Approved',
      approvedBy: 'A. Patel',
      flag: 'No',
      visit: 'TechConf',
    },
  ];

}
