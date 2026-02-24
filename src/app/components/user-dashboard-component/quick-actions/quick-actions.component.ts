import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseActionCardComponent } from '../expense-action-card/expense-action-card.component';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [ExpenseActionCardComponent],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss',
})
export class QuickActionsComponent {
  constructor(private router: Router) {}

  goToSummary() {
    this.router.navigate(['/employee/summary']);
  }

  goToVisits() {
    this.router.navigate(['/employee/visits']);
  }
}
