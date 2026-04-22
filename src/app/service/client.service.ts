import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient, private authService: AuthServiceService) { }


  fetchClients(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/clients`, { headers: { Authorization: `Bearer ${this.authService.getToken()}` } });
  }
}
