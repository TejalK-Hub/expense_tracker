import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class VisitsService {

  constructor(private http: HttpClient, private authService: AuthServiceService) { }

  visits: any[] = [];

  //----------------------------------------------------Dummy API-------------------------------------------
  fetchVisits(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/visits`, { headers: { Authorization: `Bearer ${this.authService.getToken()}` } });
  }

  fetchActiveVisits(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/visits`);
  }

  getVisits() {

    return this.visits
  }

  addVisit(visit: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/internal/visits`, visit);
  }

  fetchVisitReasons(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/internal/visit_reason`);
  }

}
