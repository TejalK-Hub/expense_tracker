import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserDashboardComponentComponent } from './components/user-dashboard-component/user-dashboard-component.component';
import { ExpenseTableComponent } from './components/shared/expense-table-component/expense-table.component';
import { ExpandableButtonComponent } from './components/shared/expandable-button-component/expandable-button.component';
import { UserBlockComponent } from './components/admin/users-component/user-block/user-block.component';
import { UserListComponent } from './components/admin/users-component/user-list/user-list.component';
import { PendingExpenseTableComponent } from './components/user-dashboard-component/pending-expense-table/pending-expense-table.component';
import { VisitsTableComponent } from './components/shared/visits-table/visits-table.component';
import { DropDownButtonComponent } from './components/shared/drop-down-button/drop-down-button.component';
import { InputComponent } from './components/shared/input/input.component';
import { AddExpensePageComponent } from './components/user-dashboard-component/add-expense-page/add-expense-page.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AddExpensePageComponent,
    VisitsTableComponent,
    DropDownButtonComponent,
    InputComponent,
    PendingExpenseTableComponent,
    RouterOutlet,
    UserBlockComponent,
    UserDashboardComponentComponent,
    UserListComponent,
    ExpenseTableComponent,
    ExpandableButtonComponent,
    AdminDashboardComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'front-end';
}
