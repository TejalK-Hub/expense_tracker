import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visits-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visits-table.component.html',
  styleUrl: './visits-table.component.scss',
})
export class VisitsTableComponent {
  visits = [
    {
      client: 'ABC Corp',
      startDate: '2026-01-10',
      endDate: '2026-01-12',
      reason: 'Project Discussion',
    },
    {
      client: 'Delta Ltd',
      startDate: '2026-02-03',
      endDate: '2026-02-05',
      reason: 'Onsite Deployment',
    },
    {
      client: 'Zenith Solutions',
      startDate: '2026-02-15',
      endDate: '2026-02-18',
      reason: 'Training Session',
    },
    {
      client: 'Nova Systems',
      startDate: '2026-03-01',
      endDate: '2026-03-02',
      reason: 'Requirement Gathering',
    },
    {
      client: 'Skyline Tech',
      startDate: '2026-03-10',
      endDate: '2026-03-14',
      reason: 'Audit Visit',
    },
  ];
}
