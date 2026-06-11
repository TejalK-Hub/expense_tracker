import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})


export class ClientService {

  constructor(private http: HttpClient) {}

  getClients(): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}/clients`
    );
  }

  getDistinctSites(): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}/clients/sites/distinct`
    );
  }

  createClient(body: any): Observable<any> {
    return this.http.post(
      `${environment.apiBaseUrl}/clients`,
      body
    );
  }

  updateClient(id: number, body: any): Observable<any> {
    return this.http.put(
      `${environment.apiBaseUrl}/clients/${id}`,
      body
    );
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(
      `${environment.apiBaseUrl}/clients/${id}`
    );
  }
}