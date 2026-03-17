import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitsService } from '../../../service/visits.service';

@Component({
  selector: 'app-visits-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visits-table.component.html',
  styleUrl: './visits-table.component.scss',
})
export class VisitsTableComponent {

  constructor(private visitService: VisitsService){}
  ngOnInit(){
    this.visitService.fetchVisits();;
  }

  // visits = [
  //   {
  //     client: 'ABC Corp',
  //     startDate: '2026-01-10',
  //     endDate: '2026-01-12',
  //     reason: 'Project Discussion',
  //     amount: 5000,
  //   },
  //   {
  //     client: 'Delta Ltd',
  //     startDate: '2026-02-03',
  //     endDate: '2026-02-05',
  //     reason: 'Onsite Deployment',
  //     amount: 7500,
  //   },
  //   {
  //     client: 'Zenith Solutions',
  //     startDate: '2026-02-15',
  //     endDate: '2026-02-18',
  //     reason: 'Training Session',
  //     amount: 3500,
  //   },
  //   {
  //     client: 'Nova Systems',
  //     startDate: '2026-03-01',
  //     endDate: '2026-03-02',
  //     reason: 'Requirement Gathering',
  //     amount: 2500,
  //   },
  //   {
  //     client: 'Skyline Tech',
  //     startDate: '2026-03-10',
  //     endDate: '2026-03-14',
  //     reason: 'Audit Visit',
  //     amount: 4000,
  //   },
  // ];

  get visits(){
    return this.visitService.visits;
  }

  // getVisits(){
  //   return this.visits
  // }
}
