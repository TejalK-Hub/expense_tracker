import { Routes } from '@angular/router';
import { ExpenseTableComponent } from './components/shared/expense-table-component/expense-table.component';
import { UserListComponent } from './components/admin/users-component/user-list/user-list.component';
import { AddExpensePageComponent } from './components/user-dashboard-component/add-expense-page/add-expense-page.component';
import { UserDashboardComponentComponent } from './components/user-dashboard-component/user-dashboard-component.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { LoginPageComponentComponent } from './components/login-page-component/login-page-component.component';

export const routes: Routes = [

    {path: '', component: LoginPageComponentComponent},

    {path: 'manage-expense', component: ExpenseTableComponent},
    {path: 'add-expense', component: AddExpensePageComponent},
    {path: 'review-expense', component: ExpenseTableComponent},
    {path: 'user-dashboard', component: UserDashboardComponentComponent},


    //Admin routes
    {path: 'admin-dashboard', component: AdminDashboardComponent},
    {path: 'users', component: UserListComponent},
    {path: 'admin-add-expense', component: AddExpensePageComponent},
    {path: 'admin-manage-expense', component: ExpenseTableComponent},
    {path: 'admin-review-expense', component: UserListComponent},

];
