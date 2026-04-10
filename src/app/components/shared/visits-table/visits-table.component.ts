import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitsService } from '../../../service/visits.service';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { AddVisitComponent } from '../add-visit/add-visit.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visits-table',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent, AddVisitComponent],
  templateUrl: './visits-table.component.html',
  styleUrl: './visits-table.component.scss',
})
export class VisitsTableComponent {

  sortDirection: 'asc' | 'desc' = 'asc';
  visits: any[] = [];



  filteredVisits: any[] = [];

filters = {
  visitName: '',
  client: '',
  startFrom: '',
  startTo: ''
};

  constructor(private visitService: VisitsService){}
  
  ngOnInit(){
    this.loadVisits();
  }

  loadVisits(){
  this.visitService.fetchVisits().subscribe((res) => {
    this.visits = res.data;
    this.filteredVisits = [...this.visits];
  });
}





applyFilters() {
  this.filteredVisits = this.visits.filter((v: any) => {

    const matchVisit =
      !this.filters.visitName || v.visit_name === this.filters.visitName;

    const matchClient =
      !this.filters.client || v.client === this.filters.client;

    const startDate = new Date(v.start_date).getTime();

    const from = this.filters.startFrom
      ? new Date(this.filters.startFrom).getTime()
      : null;

    const to = this.filters.startTo
      ? new Date(this.filters.startTo).getTime()
      : null;

    const matchDate =
      (!from || startDate >= from) &&
      (!to || startDate <= to);

    return matchVisit && matchClient && matchDate;
  });
}




clearFilters() {
  this.filters = {
    visitName: '',
    client: '',
    startFrom: '',
    startTo: ''
  };

  this.filteredVisits = [...this.visits];
}


getUnique(field: string): string[] {
  return [...new Set(this.visits.map(v => v[field]).filter(Boolean))];
}



  sortByDate() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

    this.visits.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return this.sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    });
  }

}
