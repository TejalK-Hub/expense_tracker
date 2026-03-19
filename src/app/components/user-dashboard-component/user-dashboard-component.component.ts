import { Component } from '@angular/core';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { ExpandableButtonComponent } from './../shared/expandable-button-component/expandable-button.component';
import { DashboardBlockComponent } from './../shared/dashboard-block-component/dashboard-block.component';
import { ExpenseTableComponent } from '../shared/expense-table-component/expense-table.component';
import { ButtonComponent } from '../shared/button/button.component';
import { Router } from '@angular/router';
import { PendingExpenseTableComponent } from './pending-expense-table/pending-expense-table.component';
import { AuthServiceService } from '../../service/auth-service.service';

@Component({
  selector: 'app-user-dashboard-component',
  standalone: true,
  imports: [
    ButtonComponent,
    DashboardBlockComponent,
    ExpandableButtonComponent,
    ExpenseTableComponent,
    QuickActionsComponent,
    PendingExpenseTableComponent,
  ],
  templateUrl: './user-dashboard-component.component.html',
  styleUrl: './user-dashboard-component.component.scss',
})
export class UserDashboardComponentComponent {
  constructor(private route: Router, private authService: AuthServiceService) {}

  Amount = 400;
  summary_current_month: any = {
    expenses: 100,
    expenses_amt: 2500,
  };

  viewVisits() {
    this.route.navigate(['/visits']);
  }

  handleExpense(option: number) {
    if (option === 1) {
      this.route.navigate(['/add-expense']);
    } else if (option === 2) {
      this.route.navigate(['/manage-expense']);
    } else if (option === 3) {
      this.route.navigate(['/review-expense']);
    }
  }


  //--------------------------------------------------Depricated Visits Approach-----------------------------------------
  // handleVisit(option: number){
  //   if (option===1){
  //     this.route.navigate(['/add-visit']);
  //   }else{
  //     this.route.navigate(['/visits']);
  //   }
  // }


  logout(){
    this.route.navigate(['']);
    this.authService.logout();
  }

}
