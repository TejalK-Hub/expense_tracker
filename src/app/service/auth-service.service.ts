import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor(private http: HttpClient) {}

  userToken: string | null = null;
  userId: number | null = null;
  userRole: string | null = null;
  tokenExpiration: Date | null = null;

  login(email: string, password: string): any {
    return this.http.post('http://192.168.0.105:5001/auth/login', { email, password });
    // return this.http.post('http://localhost:5001/auth/login', { email, password });
  }

  setVariables(token: string, id: number, role: string) {
    this.userToken = token;
    this.userId = id;
    this.userRole = role;
  }

  getToken(): string {
    return this.userToken || '';
  }
}
