import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import { ExpandableButtonComponent } from '../../shared/expandable-button-component/expandable-button.component';
import { Router } from '@angular/router';
import { PendingExpenseTableComponent } from '../../user-dashboard-component/pending-expense-table/pending-expense-table.component';
import { AuthServiceService } from '../../../service/auth-service.service';
import { ExpensesService } from '../../../service/expenses.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ExpandableButtonComponent, PendingExpenseTableComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  constructor(private route: Router, private authService: AuthServiceService, private expenseService: ExpensesService) { }


  // pendingExpenses: any[]=[];

  status = 'Pending';

  tableData: any
  ngOnInit() {
    this.expenseService.fetchAdminPending().subscribe((res: any) => {
      // console.log("28---",res)
      this.tableData = res.data
    })
  }

  listUsers(){
    this.route.navigate(['/user-list'])
  }

 grafanaReports() {
  window.open('http://localhost:3330/login', '_blank');
}

  handleRouting(option: number) {
    console.log("Routing option:", option);

    if (option === 1) {
      this.route.navigate(['/add-expense']);
    } else if (option === 2) {
      this.route.navigate(['/admin-review-expense']);
    } 
    // else if (option === 3) {
    //   this.route.navigate(['/admin-review-expense']);
    // }
  }



  //--------------------------------------------Pending Expense Table------------------------------------------------
  firstClick = true;

  toggleStatus(exp: any,action:any) {

    const body = {
      "action": action
    }
    
    this.expenseService.updateExpense(exp.id, body).subscribe((res: any) => {
      if (res.success == true) {
        if(body.action=='approve'){
  alert('Expense Approve Successfully');
       
        this.ngOnInit();
        }
        else if(body.action=='reject'){

        alert('Expense Rejected Successfully');
        this.ngOnInit();
        }
      
      }
    })

  }



  get pendingExpenses() {
    return this.expenseService.pendingExpenses;
  }

  getPendingExpenses() {
    return this.pendingExpenses.filter((exp: any) => {
      exp.status.toLowerCase().trim() === 'Submitted'.toLowerCase().trim();
    });
  }

  logout() {
    this.route.navigate(['']);
    this.authService.logout();
  }
}
