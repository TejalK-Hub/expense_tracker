import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { CommonModule } from '@angular/common';

import { AuthServiceService } from '../../../service/auth-service.service';
import { SharedServicesService } from '../../../service/shared-services.service';
import { VisitsService } from '../../../service/visits.service';

import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-visit',
  standalone: true,
  imports: [ReactiveFormsModule, BackButtonComponent, CommonModule],
  templateUrl: './add-visit.component.html',
  styleUrl: './add-visit.component.scss'
})
export class AddVisitComponent {

  visitForm!: FormGroup;

  clients: any;
  visitReasons: any;

  showPopup: boolean = false;


  @Output() visitCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,

    private authService: AuthServiceService,
    private sharedService: SharedServicesService,
    private visitService: VisitsService,

    private toastr: ToastrService
  ) { }

  ngOnInit() {

    this.visitForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: [''],
      client_id: ['', Validators.required],
      visit_reason_id: ['', Validators.required],
      agenda: [''],
      client_site: [{ value: 'NA', disabled: true }]
    }, {
      validators: this.dateValidator // ✅ attach validator here
    });

    this.sharedService.fetchClients().subscribe(res => {
      this.clients = res.data;
    });

    this.visitService.fetchVisitReasons().subscribe(res => {
      this.visitReasons = res.data;
    });
  }

  // ✅ CUSTOM VALIDATOR
  dateValidator(group: AbstractControl) {
    const start = group.get('start_date')?.value;
    const end = group.get('end_date')?.value;

    if (!start || !end) return null;

    return end < start ? { invalidDate: true } : null;
  }

  clearFields() {
    this.visitForm.reset();
  }

  onSubmit() {

    // ❌ DON'T navigate before validation (this was wrong in your code)
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }



    const formValues = this.visitForm.value;

        const body = {
          // user_id: this.authService.userId,
          visit_reason_id: Number(formValues.visit_reason_id),
          client_id: Number(formValues.client_id),
          start_date: formValues.start_date,
          end_date: formValues.end_date,
          agenda: formValues.agenda,
          client_site: 'NA'
        };

    this.visitService.addVisit(body).subscribe({
      next: (res) => {
        this.visitCreated.emit();
        this.toastr.success('Visit added successfully!');



        this.visitForm.reset();

        // ✅ Navigate AFTER success
        // this.router.navigate(['/visits']);
      }
    });
  }
}