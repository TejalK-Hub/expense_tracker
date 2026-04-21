import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthServiceService } from './auth-service.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(
    private httpClient: HttpClient,
    private auth: AuthServiceService,
  ) { }

  expenses: any[] = [];
  pendingExpenses: any[] = [];



  selectedExpense: any = null;

  setSelectedExpense(expense: any) {
    this.selectedExpense = expense;
  }

  getSelectedExpense() {
    console.log(this.selectedExpense);
    return this.selectedExpense;
  }


  // ------------------------------------------------------Add/Update Expense------------------------------------------------------


  addExpense(expense: any) {

    console.log(this.auth.userId, " :: ", this.auth.userRole);
    return this.httpClient.post(`${environment.apiBaseUrl}/expenses`, expense, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } });

  }

  resubmit(expense_id: number, body: any): Observable<any>  {
    return this.httpClient.put(`${environment.apiBaseUrl}/expenses/${expense_id}`, body, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } });
  }

  // fetchAdminPending() {

  //   return this.httpClient.get(`${environment.apiBaseUrl}/expenses/all?status=submitted`).subscribe({
  //     next: (res: any) => {
  //       this.pendingExpenses = res.data;
  //       console.log("Admin pending Expenses: ", this.pendingExpenses);
  //     },

  //     error: (err: any) => {
  //       console.log(err);
  //     }
  //   })
  // }

  // ------------------------------------------------------User Dashboard Summary Blocks------------------------------------------------------

  fetchExpenseSummary(): Observable<any> {
    return this.httpClient.get(`${environment.apiBaseUrl}/expenses/user/summary`, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } })
  }



  // ------------------------------------------------------User: Manage Expenses------------------------------------------------------

  fetchExpense(): Observable<any> {
    return this.httpClient.get(`${environment.apiBaseUrl}/expenses/user/all`, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } })
    return this.httpClient.get(`${environment.apiBaseUrl}/expenses/user?user_id=${this.auth.userId}`, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } })
  }


  // ------------------------------------------------------Admin: User Manage Expenses------------------------------------------------------

  fetchExpenses(): Observable<any> {

    // let params = new HttpParams()
    //   .set('month', date);
    // // .set('status', 'approved');

    // userIds.forEach(id => {
    //   params = params.append('user_id', id.toString());
    // });

    return this.httpClient.get(
      `${environment.apiBaseUrl}/expenses/all/full`,
      {
        headers: {
          Authorization: `Bearer ${this.auth.getToken()}`
        }
      }
    );
  }



  // ------------------------------------------------------Dashboard Pending Expense Table------------------------------------------------------


  fetchEmployeePending(): Observable<any> {
    return this.httpClient.get(`${environment.apiBaseUrl}/expenses/user`, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } })
  }


  fetchAdminPending(): Observable<any> {
    return this.httpClient.get(`${environment.apiBaseUrl}/expenses/all?status=submitted`, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } })
  }





  fetchRejectionReasons(): Observable<any> {
    return this.httpClient.get(`${environment.apiBaseUrl}/internal/rejection_reason`, { headers: { Authorization: `Bearer ${this.auth.getToken()}` } })
  }






  updateExpense(id: any, body: any): Observable<any> {
    return this.httpClient.put(`${environment.apiBaseUrl}/expenses/${id}/status`, body);
  }

  updateExpenseStatus(id: string, body: any): Observable<any> {
    return this.httpClient.put(`${environment.apiBaseUrl}/expenses/${id}/status`,
      {
        action: body.action,
        rejection_reason_id: body.rejection_reason_id,
        rejection_description: body.rejection_description
      },
      {
        headers: { Authorization: `Bearer ${this.auth.getToken()}` }
      }
    );
  }

}