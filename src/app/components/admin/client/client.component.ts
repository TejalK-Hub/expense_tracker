import { Component, NgModule } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ClientService } from '../../../service/client.service';

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
    id: null,
    name: '',
    sites: [''],
    contact: '',
    email: ''
  };


  existingSites: string[] = [];


  isEditMode = false;


  constructor(
    private clientService: ClientService
  ) { }

  ngOnInit() {
    this.loadClients();
    this.loadDistinctSites();
  }

  loadClients() {

    this.clientService.getClients()
      .subscribe({

        next: (res: any) => {

          this.clients = res.data.map((client: any) => ({
            ...client,
            sites: Array.isArray(client.site)
              ? client.site
              : []
          }));

        },

        error: (err) => {
          console.error(err);
        }

      });

  }

  loadDistinctSites() {

    this.clientService.getDistinctSites()
      .subscribe({

        next: (res: any) => {

          this.existingSites = res.data || [];

        },

        error: (err) => {
          console.error(err);
        }

      });

  }


  addSiteField() {
    this.clientForm.sites.push('');
  }

  removeSiteField(index: number) {

    if (this.clientForm.sites.length === 1) {
      return;
    }

    this.clientForm.sites.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  saveClient() {

    const validSites = this.clientForm.sites
      .map(site => site.trim())
      .filter(site => site);

    if (
      !this.clientForm.name.trim() ||
      // !this.clientForm.contact ||
      // !this.clientForm.email.trim() ||
      validSites.length === 0
    ) {
      alert('All fields are required');
      return;
    }

    const payload = {
      name: this.clientForm.name,
      sites: validSites,
      contact: this.clientForm.contact,
      email: this.clientForm.email
    };

    if (this.isEditMode) {

      this.clientService.updateClient(
        Number(this.clientForm.id),
        payload
      )
        .subscribe({

          next: () => {

            this.loadClients();
            this.loadDistinctSites();

            this.resetForm();

            const modal =
              (window as any).bootstrap.Modal.getInstance(
                document.getElementById('clientModal')
              );

            modal?.hide();
          },

          error: (err) => {
            console.error(err);
          }

        });

    } else {

      this.clientService.createClient(payload)
        .subscribe({

          next: () => {

            this.loadClients();
            this.loadDistinctSites();

            this.resetForm();

            const modal =
              (window as any).bootstrap.Modal.getInstance(
                document.getElementById('clientModal')
              );

            modal?.hide();
          },

          error: (err) => {
            console.error(err);
          }

        });

    }
  }

  editClient(client: any) {

    this.isEditMode = true;

    this.clientForm = {
      id: client.id,
      name: client.name,
      sites: [...(client.sites || [''])],
      contact: client.contact,
      email: client.email
    };

    const modal =
      new (window as any).bootstrap.Modal(
        document.getElementById('clientModal')
      );

    modal.show();
  }

  deleteClient(client: any) {

    if (!confirm(`Delete ${client.name}?`)) {
      return;
    }

    this.clientService.deleteClient(client.id)
      .subscribe({

        next: () => {

          this.loadClients();
          this.loadDistinctSites();

        },

        error: (err) => {
          console.error(err);
        }

      });
  }

  // updateExistingSites() {

  //   const allSites = this.clients.flatMap(
  //     c => c.sites || []
  //   );

  //   this.existingSites = [...new Set(allSites)];
  // }

  resetForm() {
    this.isEditMode = false;

    this.clientForm = {
      id: null,
      name: '',
      sites: [''],
      contact: '',
      email: ''
    };
  }
}