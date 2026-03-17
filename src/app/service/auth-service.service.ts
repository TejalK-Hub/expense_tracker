import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {

  userToken: string | null = null;
  userId: number | null = null;
  userRole: string | null = null;
  tokenExpiration: Date | null = null;

  constructor(private http: HttpClient) {

    // Restore session after page refresh
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');

    if (token && id && role) {
      this.userToken = token;
      this.userId = Number(id);
      this.userRole = role;
    }
  }

  login(email: string, password: string) {
    return this.http.post('http://192.168.0.105:5001/auth/login', { email, password });
    // return this.http.post('http://localhost:5001/auth/login', { email, password });
  }

  setVariables(token: string, id: number, role: string) {

    this.userToken = token;
    this.userId = id;
    this.userRole = role;

    // Persist session
    localStorage.setItem('token', token);
    localStorage.setItem('userId', id.toString());
    localStorage.setItem('userRole', role);

  }

  getToken(): string {
    return this.userToken || localStorage.getItem('token') || '';
  }

  logout() {
    this.userToken = null;
    this.userId = null;
    this.userRole = null;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');

  }

}






































// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthServiceService {
//   constructor(private http: HttpClient) {}

//   userToken: string | null = null;
//   userId: number | null = null;
//   userRole: string | null = null;
//   tokenExpiration: Date | null = null;

//   login(email: string, password: string): any {
//     return this.http.post('http://192.168.0.105:5001/auth/login', {
//       email,
//       password,
//     });
//     // return this.http.post('http://localhost:5001/auth/login', { email, password });
//   }

//   setVariables(token: string, id: number, role: string) {
//     this.userToken = token;
//     this.userId = id;
//     this.userRole = role;
//     // console.log('Auth variables set:', { token, id, role });

//     localStorage.setItem('token', token);
//     localStorage.setItem('userId', id.toString());
//     localStorage.setItem('userRole', role);
//   }

//   getToken(): string {
//     return this.userToken || '';
//   }
// }
