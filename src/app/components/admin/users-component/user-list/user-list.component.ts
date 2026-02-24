import { Component } from '@angular/core';
import { UserBlockComponent } from '../user-block/user-block.component';
import { SharedModule } from '../../../shared/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CalendarModule,
    CommonModule,
    FormsModule,
    UserBlockComponent,
    SharedModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  today = new Date();
  selectedMonth!: Date;
  yearlyUserExpenses: {
    [year: string]: {
      [month: string]: {
        userId: number;
        name: string;
        email: string;
        expense: number;
      }[];
    };
  } = {
    2025: {
      Oct: [
        { userId: 1, name: 'Amit', email: 'amit@company.com', expense: 4200 },
        { userId: 2, name: 'Sneha', email: 'sneha@company.com', expense: 3100 },
        { userId: 3, name: 'Rohit', email: 'rohit@company.com', expense: 2800 },
        { userId: 4, name: 'Priya', email: 'priya@company.com', expense: 3900 },
      ],

      Nov: [
        { userId: 1, name: 'Amit', email: 'amit@company.com', expense: 4600 },
        { userId: 2, name: 'Sneha', email: 'sneha@company.com', expense: 3500 },
        { userId: 3, name: 'Rohit', email: 'rohit@company.com', expense: 5100 },
        { userId: 4, name: 'Priya', email: 'priya@company.com', expense: 2950 },
      ],

      Dec: [
        { userId: 1, name: 'Amit', email: 'amit@company.com', expense: 5300 },
        { userId: 2, name: 'Sneha', email: 'sneha@company.com', expense: 4200 },
        { userId: 3, name: 'Rohit', email: 'rohit@company.com', expense: 3700 },
        { userId: 4, name: 'Priya', email: 'priya@company.com', expense: 4800 },
      ],
    },

    2026: {
      Jan: [
        { userId: 1, name: 'Amit', email: 'amit@company.com', expense: 4500 },
        { userId: 2, name: 'Sneha', email: 'sneha@company.com', expense: 3200 },
        { userId: 3, name: 'Rohit', email: 'rohit@company.com', expense: 5100 },
        { userId: 4, name: 'Priya', email: 'priya@company.com', expense: 2750 },
      ],

      Feb: [
        { userId: 1, name: 'Amit', email: 'amit@company.com', expense: 3800 },
        { userId: 2, name: 'Sneha', email: 'sneha@company.com', expense: 4100 },
        { userId: 3, name: 'Rohit', email: 'rohit@company.com', expense: 2900 },
        { userId: 4, name: 'Priya', email: 'priya@company.com', expense: 4600 },
      ],

      Mar: [
        { userId: 1, name: 'Amit', email: 'amit@company.com', expense: 5200 },
        { userId: 2, name: 'Sneha', email: 'sneha@company.com', expense: 3000 },
        { userId: 3, name: 'Rohit', email: 'rohit@company.com', expense: 4700 },
        { userId: 4, name: 'Priya', email: 'priya@company.com', expense: 3500 },
      ],
    },
  };

  getMonthKey(date: Date) {
  return date.toLocaleString('en-US', { month: 'short' });
}


}
