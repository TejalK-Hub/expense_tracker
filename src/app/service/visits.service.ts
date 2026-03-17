import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VisitsService {

  constructor(private http: HttpClient) { }

  visits: any[]=[];

  fetchVisits(){
    this.http.get(`http://192.168.0.105:5001/internal/visits`).subscribe(
      {next: (res:any) => {this.visits = res.data},
      error: (err) => {console.log(err)}}
    );
  }

  getVisits(){

    return this.visits
  }

}
