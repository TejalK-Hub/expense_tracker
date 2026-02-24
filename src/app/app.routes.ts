import { Routes } from '@angular/router';
import { ExpenseTableComponent } from './components/shared/expense-table-component/expense-table.component';
import { UserListComponent } from './components/admin/users-component/user-list/user-list.component';
import { AddExpensePageComponent } from './components/user-dashboard-component/add-expense-page/add-expense-page.component';

export const routes: Routes = [

    {path: 'manage-expense', component: ExpenseTableComponent},
    {path: 'add-expense', component: AddExpensePageComponent},
    {path: 'review-expense', component: ExpenseTableComponent},


    //Admin routes
    {path: 'users', component: UserListComponent}

];
