import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/button/button.component';
import { ExpandableButtonComponent } from '../../shared/expandable-button-component/expandable-button.component';
import { Router } from '@angular/router';
import { PendingExpenseTableComponent } from '../../user-dashboard-component/pending-expense-table/pending-expense-table.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ExpandableButtonComponent, PendingExpenseTableComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  constructor(private route: Router) {}

  handleRouting(option: number) {
    console.log("Routing option:", option);

    if (option === 1) {
      this.route.navigate(['/admin-add-expense']);
    } else if (option === 2) {
      this.route.navigate(['/admin-manage-expense']);
    } else if (option === 3) {
      this.route.navigate(['/admin-review-expense']);
    }
  }
}
