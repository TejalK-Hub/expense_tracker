import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }



  getUsers() : Observable<any>{
    return this.http.get('http://192.168.0.105:5001/internal/users')
  }



}
