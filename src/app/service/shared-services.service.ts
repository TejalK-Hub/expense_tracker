import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class SharedServicesService {

  constructor(private authService: AuthServiceService, private http: HttpClient) { }

  fetchClients(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/internal/clients`);
  }

  fetchCategories(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/internal/expense_category`);
  }




  // fetchRejectionReason(): Observable<any> {
  //   return this.http.get(`${environment.apiBaseUrl}/internal/visit_reason`);
  // }

  

}
