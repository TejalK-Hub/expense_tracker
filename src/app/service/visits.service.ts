import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitsService {

  constructor(private http: HttpClient) { }

  visits: any[]=[];

  fetchVisits(){
    this.http.get(`${environment.apiBaseUrl}/internal/visits`).subscribe(
      {next: (res:any) => {this.visits = res.data},
      error: (err) => {console.log(err)}}
    );
  }

  getVisits(){

    return this.visits
  }

  addVisit(visit: any){
    return this.http.post(`${environment.apiBaseUrl}/internal/visits`, visit);
  }

}
