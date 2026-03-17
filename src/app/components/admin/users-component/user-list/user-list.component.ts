import { Component } from '@angular/core';
import { UserBlockComponent } from '../user-block/user-block.component';
import { SharedModule } from '../../../shared/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../../../service/users.service';
import { AuthServiceService } from '../../../../service/auth-service.service';

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
  date: Date | undefined;
  today: Date = new Date(); 
  selectedMonth: Date = new Date();
  users: any[] = []

  constructor(
    private router: Router,
    private userService: UsersService,
    private authService: AuthServiceService
  ) {
 
  }

  ngOnInit() {
    // this.filterByMonth();
    this.userService.getUsers().subscribe((res)=>{
      console.log("res---->",res)
      console.log("This is the admin token:", this.authService.userToken);
      console.log("DATE:", this.date);
      this.users=res.data
    })
  }

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
        {
          userId: 1,
          name: 'Pranjul',
          email: 'pranjul@samprama.com',
          expense: 4200,
        },
        {
          userId: 2,
          name: 'Ramesh',
          email: 'ramesh@samprama.com',
          expense: 3100,
        },
        {
          userId: 3,
          name: 'Aditya',
          email: 'Aditya@samprama.com',
          expense: 2800,
        },
        {
          userId: 4,
          name: 'Priya',
          email: 'priya@samprama.com',
          expense: 3900,
        },
      ],

      Nov: [
        {
          userId: 1,
          name: 'Pranjul',
          email: 'pranjul@samprama.com',
          expense: 4600,
        },
        {
          userId: 2,
          name: 'Ramesh',
          email: 'ramesh@samprama.com',
          expense: 3500,
        },
        {
          userId: 3,
          name: 'Aditya',
          email: 'Aditya@samprama.com',
          expense: 5100,
        },
        {
          userId: 4,
          name: 'Priya',
          email: 'priya@samprama.com',
          expense: 2950,
        },
      ],

      Dec: [
        {
          userId: 1,
          name: 'Pranjul',
          email: 'pranjul@samprama.com',
          expense: 5300,
        },
        {
          userId: 2,
          name: 'Ramesh',
          email: 'ramesh@samprama.com',
          expense: 4200,
        },
        {
          userId: 3,
          name: 'Aditya',
          email: 'Aditya@samprama.com',
          expense: 3700,
        },
        {
          userId: 4,
          name: 'Priya',
          email: 'priya@samprama.com',
          expense: 4800,
        },
      ],
    },

    2026: {
      Jan: [
        {
          userId: 1,
          name: 'Pranjul',
          email: 'pranjul@samprama.com',
          expense: 4500,
        },
        {
          userId: 2,
          name: 'Ramesh',
          email: 'ramesh@samprama.com',
          expense: 3200,
        },
        {
          userId: 3,
          name: 'Aditya',
          email: 'Aditya@samprama.com',
          expense: 5100,
        },
        {
          userId: 4,
          name: 'Priya',
          email: 'priya@samprama.com',
          expense: 2750,
        },
      ],

      Feb: [
        {
          userId: 1,
          name: 'Pranjul',
          email: 'pranjul@samprama.com',
          expense: 3800,
        },
        {
          userId: 2,
          name: 'Ramesh',
          email: 'ramesh@samprama.com',
          expense: 4100,
        },
        {
          userId: 3,
          name: 'Aditya',
          email: 'Aditya@samprama.com',
          expense: 2900,
        },
        {
          userId: 4,
          name: 'Priya',
          email: 'priya@samprama.com',
          expense: 4600,
        },
      ],

      Mar: [
        {
          userId: 1,
          name: 'Pranjul',
          email: 'pranjul@samprama.com',
          expense: 5200,
        },
        {
          userId: 2,
          name: 'Ramesh',
          email: 'ramesh@samprama.com',
          expense: 3000,
        },
        {
          userId: 3,
          name: 'Aditya',
          email: 'Aditya@samprama.com',
          expense: 4700,
        },
        {
          userId: 4,
          name: 'Priya',
          email: 'priya@samprama.com',
          expense: 3500,
        },
      ],
    },
  };

  ngOnint() {
    this.userService.getUsers();
  }


  //-----------------------------------------------------Users Monthly Expenses------------------------------------------------------

  // filteredUsers: any[] = [];
  //   filterByMonth() {
  //     this.filteredUsers = this.getUsersForSelectedMonth();
  //   }

  // getMonthKey(date: Date) {
  //   return date.toLocaleString('default', { month: 'short' });
  // }

  // getUsersForSelectedMonth() {
  //   if (!this.selectedMonth) return [];

  //   const year = this.selectedMonth.getFullYear();
  //   const month = this.getMonthKey(this.selectedMonth);

  //   return this.yearlyUserExpenses?.[year]?.[month] || [];
  // }

  
  openUserExpenses() {
    this.router.navigate(['/user-expense-review']);
  }

}
