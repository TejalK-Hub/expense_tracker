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

  date!: string;
  users: any[] = [];
  selectedUsers: any[] = [];
  maxMonth!: string;

  constructor(
    private router: Router,
    private userService: UsersService,
    private authService: AuthServiceService
  ) {}

  ngOnInit() {
    let temp = new Date();
    // temp.setMonth(temp.getMonth() - 1);
    this.date = `${temp.getFullYear()}-${String(temp.getMonth() + 1).padStart(2, '0')}`;

    const today = new Date();
    // today.setMonth(today.getMonth() - 1);
    console.log("Default Date:", today.getMonth()); 

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    this.maxMonth = `${year}-${month}`;

    this.userService.getUsers().subscribe((res) => {
      this.users = res.data;
    });
  }

  //--------------------------------------------------Selected Users-------------------------------------------------------

  isSelected(userId: number): boolean {
    return this.selectedUsers.some(u => u.id === userId);
  }

  toggleUser(user: any, event: any) {
    const checked = event.target.checked;

    if (checked) {
      if (!this.selectedUsers.some(u => u.id === user.id)) {
        this.selectedUsers.push(user);
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    }

    // console.log("Selected Users:", this.selectedUsers);
  }

  //--------------------------------------------------All Selected-------------------------------------------------------

  isAllSelected(): boolean {
    return this.users.length > 0 && this.selectedUsers.length === this.users.length;
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;

    if (checked) {
      this.selectedUsers = [...this.users];
    } else {
      this.selectedUsers = [];
    }

    // console.log("Select All:", this.selectedUsers);
  }

  //-------------------------------------------------------View Expenses-------------------------------------------------------

  viewExpenses() {
    const ids = this.selectedUsers.map(user => user.id);

    this.router.navigate(['/user-expense-review'], {
      queryParams: {
        date: this.date,
        userIds: ids.join(','),
      }
    });

    console.log("Users:", ids, "\nDate:", this.date);
  }

  //-----------------------------------------------------Clear Selection----------------------------------------------------------- 

  clearSelection() {
    this.selectedUsers = [];
  }

  dateOnChange(event: any) {
    this.date = (event.target as HTMLInputElement).value;
    this.selectedUsers = [];
  }
}