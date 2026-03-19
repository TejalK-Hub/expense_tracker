import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { AuthServiceService } from '../../../service/auth-service.service';
import { VisitsService } from '../../../service/visits.service';

@Component({
  selector: 'app-add-visit',
  standalone: true,
  imports: [FormsModule, BackButtonComponent],
  templateUrl: './add-visit.component.html',
  styleUrl: './add-visit.component.scss'
})
export class AddVisitComponent {

  constructor(private authService: AuthServiceService, private visitService: VisitsService) { }

  s_date: string = '';
  e_date: string = '';
  cli_name: string = '';
  agenda: string = '';


  onSubmit() {
    const formData = new FormData();

    formData.append('user_id', this.authService.userId?.toString() ?? '0');
    formData.append('visit_reason_id', '1');
    formData.append('client_id', '1');
    formData.append('start_date', this.s_date);
    formData.append('end_date', this.e_date);


    this.visitService.addVisit(formData);
  }
}
