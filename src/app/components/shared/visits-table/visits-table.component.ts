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

  private readonly FILTER_KEY = 'visits_filters_v1';

  constructor(private visitService: VisitsService) { }

  ngOnInit() {
    this.loadFilters();
    this.loadVisits();
  }

  loadVisits() {
    this.visitService.fetchVisits().subscribe((res) => {
      this.visits = res.data;
      this.applyFilters();
    });
  }




  saveFilters() {
    localStorage.setItem(this.FILTER_KEY, JSON.stringify(this.filters));
  }

  loadFilters() {
    const saved = localStorage.getItem(this.FILTER_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        this.filters = {
          ...this.filters,
          ...parsed
        };

      } catch {
        this.clearFilters();
      }
    }
  }



  applyFilters() {
    this.saveFilters();

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

    this.applySorting();
  }



  // Active Filters

  hasActiveFilters(): boolean {
    const f = this.filters;

    return !!(
      f.visitName ||
      f.client ||
      f.startFrom ||
      f.startTo
    );
  }



  removeFilter(type: string) {

    switch (type) {
      case 'visitName':
        this.filters.visitName = '';
        break;

      case 'client':
        this.filters.client = '';
        break;

      case 'date':
        this.filters.startFrom = '';
        this.filters.startTo = '';
        break;
    }

    this.saveFilters();
    this.applyFilters();
  }

  clearFilters() {
    this.filters = {
      visitName: '',
      client: '',
      startFrom: '',
      startTo: ''
    };
    localStorage.removeItem(this.FILTER_KEY);
    this.filteredVisits = [...this.visits];
    this.applyFilters();
  }


  getUnique(field: string): string[] {
    return [...new Set(this.visits.map(v => v[field]).filter(Boolean))];
  }



  applySorting() {
    this.filteredVisits.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return this.sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    });
  }

  sortByDate() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySorting();
  }

}
