import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense-action-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-action-card.component.html',
  styleUrl: './expense-action-card.component.scss',
})
export class ExpenseActionCardComponent {
  constructor(private router: Router) {}

  expanded = false;

  //   expenses = [
  //   ["Client Lunch", "2026-01-12", "Meals & Ent.", "lunch_0112.pdf", 68.40, "Approved", "J. Smith", "No", "Client A"],
  //   ["Uber Ride", "2026-01-13", "Travel", "uber_0113.png", 24.75, "Pending", "", "No", "HQ Visit"],
  //   ["Hotel Stay", "2026-01-10", "Accommodation", "hotel_0110.pdf", 312.00, "Approved", "M. Chen", "No", "NYC Trip"],
  //   ["Office Supplies", "2026-01-09", "Supplies", "staples_0109.pdf", 89.15, "Rejected", "A. Patel", "Yes", ""],
  //   ["Flight Ticket", "2026-01-05", "Travel", "flight_0105.pdf", 540.60, "Approved", "J. Smith", "No", "SF Visit"],
  //   ["Team Dinner", "2026-01-14", "Meals & Ent.", "dinner_0114.jpg", 156.90, "Pending", "", "No", "Team Meet"],
  //   ["Taxi Fare", "2026-01-08", "Travel", "taxi_0108.png", 32.50, "Approved", "M. Chen", "No", "Airport Run"],
  //   ["Conference Fee", "2026-01-02", "Training", "conf_0102.pdf", 799.00, "Approved", "A. Patel", "No", "TechConf"]
  // ];

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

  toggleMenu() {
    this.expanded = !this.expanded;
  }

  goToAddExpense() {
    this.expanded = false;
    this.router.navigate(['/expense/add']);
  }

  goToManageExpense() {
    this.expanded = false;
    this.router.navigate(['/expense/manage']);
  }
}
