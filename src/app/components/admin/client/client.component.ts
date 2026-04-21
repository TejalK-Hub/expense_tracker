import { Component, NgModule } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BackButtonComponent } from '../../back-button/back-button.component';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [FormsModule, BackButtonComponent, CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent {

  clients: any[] = [];

  clientForm = {
    name: '',
    city: '',
    contact: '',
    email: ''
  };

  saveClient() {
    if (!this.clientForm.name || !this.clientForm.city ||
        !this.clientForm.contact || !this.clientForm.email) {
      alert('All fields are required');
      return;
    }

    this.clients.push({ ...this.clientForm });

    console.log('Client Added:', this.clientForm);

    this.resetForm();

    // close modal
    const modalEl = document.getElementById('clientModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }

  resetForm() {
    this.clientForm = {
      name: '',
      city: '',
      contact: '',
      email: ''
    };
  }
}