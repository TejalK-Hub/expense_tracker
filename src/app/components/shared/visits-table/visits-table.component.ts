import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VisitsService } from '../../../service/visits.service';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { AddVisitComponent } from '../add-visit/add-visit.component';
import { AuthServiceService } from '../../../service/auth-service.service';

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
    client_branch: '',
    startFrom: '',
    startTo: ''
  };

  // ===== VISIT SEARCH DROPDOWN =====
  visitSearch = '';
  filteredVisitNames: string[] = [];
  isVisitDropdownOpen = false;

  private readonly FILTER_KEY = 'visits_filters_v1';

  constructor(private authService: AuthServiceService, private visitService: VisitsService, private router: Router) { }

  ngOnInit() {
    this.loadFilters();
    this.loadVisits();
  }

  loadVisits() {
    this.visitService.fetchVisits().subscribe((res) => {
      this.visits = res.data;

      this.filteredVisitNames = this.getUnique('visit_name'); // ✅ important

      this.applyFilters();
    });
  }


  /*------------------------------------- VIEW THIS VISIT'S EXPENSES ------------------------------------*/
  goToVisitDetails(visitId: any) {
    // Implement navigation to visit details page
    console.log('Navigate to details of visit ID:', visitId);

    const queryParams: any = {
      visit: visitId.visit_name
    }
    if (this.authService.isAdmin) {
    this.router.navigate(['/user-expense-review'], { queryParams });
    // Example: this.router.navigate(['/visit-details', visitId]);
    } else {
      this.router.navigate(['/manage-expense'], { queryParams });
    }
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
        this.visitSearch = this.filters.visitName || '';

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


  // ----------------- VISIT SEARCH -----------------
  onVisitSearchChange() {
    const search = this.visitSearch.toLowerCase();

    this.filteredVisitNames = this.getUnique('visit_name').filter(v =>
      v.toLowerCase().includes(search)
    );
  }

  selectVisit(value: string) {
    this.filters.visitName = value;
    this.visitSearch = value;
    this.isVisitDropdownOpen = false;
    this.applyFilters();
  }

  openVisitDropdown() {
    this.isVisitDropdownOpen = true;
    this.filteredVisitNames = this.getUnique('visit_name'); // show full list
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
      client_branch: '',
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


  //--------------------- SORTING ---------------------

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
