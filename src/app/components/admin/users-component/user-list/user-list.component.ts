import { Component } from '@angular/core';
import { UserBlockComponent } from '../user-block/user-block.component';
import { SharedModule } from '../../../shared/shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../../../service/users.service';
import { AuthServiceService } from '../../../../service/auth-service.service';
import { BackButtonComponent } from '../../../back-button/back-button.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CalendarModule,
    CommonModule,
    FormsModule,
    UserBlockComponent,
    SharedModule,
    BackButtonComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  
  // today: Date = new Date();
  // selectedMonth: Date = new Date();


  date!: string;
  users: any[] = [];
  selectedUserIds: number[] = [];
  maxMonth!: string;

  constructor(
    private router: Router,
    private userService: UsersService,
    private authService: AuthServiceService
  ) {

  }

  ngOnInit() {
    // this.filterByMonth();
    // this.userService.getUsers();
    let temp = new Date();
    temp.setMonth(temp.getMonth() - 1);
    this.date = `${temp.getFullYear()}-${String(temp.getMonth() + 1).padStart(2, '0')}`;


    const today = new Date();
    today.setMonth(today.getMonth() - 1);

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    this.maxMonth = `${year}-${month}`;

    this.userService.getUsers().subscribe((res) => {
      console.log("res---->", res)
      console.log("This is the admin token:", this.authService.userToken);
      console.log("DATE:", this.date);
      this.users = res.data;
    });
  }



//--------------------------------------------------Selected Users-------------------------------------------------------

  isSelected(userId: number): boolean {
    return this.selectedUserIds.includes(userId);
  }

  toggleUser(userId: number, event: any) {
    const checked = event.target.checked;

    if (checked && !this.selectedUserIds.includes(userId)) {
      this.selectedUserIds.push(userId);
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    }
  }

//--------------------------------------------------All Selected-------------------------------------------------------

  isAllSelected(): boolean {
    return this.users.length > 0 && this.selectedUserIds.length === this.users.length;
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;

    if (checked) {
      this.selectedUserIds = this.users.map(user => user.id);
    } else {
      this.selectedUserIds = [];
    }
  }



//-------------------------------------------------------View Expenses-------------------------------------------------------

viewExpenses() {
  this.router.navigate(['/user-expense-review'], {
    queryParams: {
      userIds: this.selectedUserIds.join(','),
      date: this.date
    }
  });

  console.log("User: ", this.selectedUserIds, "\nDate: ", this.date);
}

 
//-----------------------------------------------------Clear Selection----------------------------------------------------------- 

clearSelection() {
  this.selectedUserIds = [];
}

  dateOnChange(event: any) {
    this.date = (event.target as HTMLInputElement).value;
    this.selectedUserIds = [];
    console.log("This is the date:", this.date);

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

  // ngOnint() {
  //   this.userService.getUsers();
  // }


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


}
