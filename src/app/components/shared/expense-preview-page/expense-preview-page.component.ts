import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../../environments/environment';

import { AuthServiceService } from '../../../service/auth-service.service';
import { ExpensesService } from '../../../service/expenses.service';
import { SharedServicesService } from '../../../service/shared-services.service';

import { BackButtonComponent } from '../../back-button/back-button.component';
import { AddExpenseFormComponent } from '../../user-dashboard-component/add-expense-form/add-expense-form.component';


@Component({
  selector: 'app-expense-preview-page',
  standalone: true,
  imports: [
    BackButtonComponent,
    AddExpenseFormComponent,
    
    CommonModule,
    FormsModule
  ],
  templateUrl: './expense-preview-page.component.html',
  styleUrl: './expense-preview-page.component.scss',
})


export class ExpensePreviewPageComponent {

  // Expense Data
  expense: any;
  apiBaseUrl: string = environment.apiBaseUrl;
  body: any = {};

  // Flags
  isAdmin: boolean = false;
  isReviewable: boolean = false;
  isRejected: boolean = false;
  isDeletable: boolean = false;

  // Image Preview
  showImagePreview = false;
  imagePaths: string[] = [];
  previewImage: string = '';

  // Rejection Modal
  rejectionReasons: any;
  selectedRejectionReason: string = '';
  rejectionDescription: string = '';

  // Resubmission Modal
  amount: number = 0;
  categories: any;
  selectedCategory: string = '';
  resubmissionDescription: string = '';

  constructor(
    private expenseService: ExpensesService,
    private router: Router,
    private authService: AuthServiceService,
    private sharedService: SharedServicesService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.expense = this.expenseService.getCurrentExpense();

    if (!this.expense) {
      console.log(
        'No expense selected, redirecting back to manage expense page.'
      );

      this.router.navigate(['/manage-expense']);
      return;
    }

    this.initialChecks();
    this.getRejectionReason();
    this.getImagePath();

  }


  // ------------------------------------------------------Initial Checks------------------------------------------------------
  initialChecks() {

    this.isAdmin = false;
    this.isRejected = false;
    this.isReviewable = false;
    this.isDeletable = false;

    if (this.authService.userRole?.toLowerCase() === 'admin') {
      this.isAdmin = true;
    }

    if (this.isAdmin) {
      if (this.expense.status === 'Rejected' && this.authService.userId === this.expense.user_id) {
        this.isRejected = true;
      }
    } else {
      if (this.expense.status === 'Rejected') {
        this.isRejected = true;
      }
    }

    if (this.isAdmin && this.authService.userId !== this.expense.user_id && this.expense.status === 'Submitted') {
      this.isReviewable = true;
    }

    this.deletable();

  }


  // ------------------------------------------------------DELETE EXPENSE LOGIC------------------------------------------------------
  deletable() {
    if (this.isAdmin) {
      if (this.expense.user_id === this.authService.userId && this.expense.approved_at == null) {
        this.isDeletable = true;
      }
    } else {
      if (!this.expense.approved_at) {
        this.isDeletable = true;
      }
    }
    if (this.expense.approved_at == null && !this.isAdmin) {
      this.isDeletable = true;
    }
  }

  deleteExpense() {
    this.expenseService.deleteExpense(this.expense.id).subscribe({
      next: () => {
        this.toastr.success('Expense deleted successfully!');
      },
      error: (err) => {
        console.log("Error deleting expense: ", err);
        this.toastr.error(err.error?.message || 'Failed to delete expense!');
      }
    })
  }

  confirmDelete() {
    const confirmed = window.confirm('Are you sure, you want to delete this expense?');
    if (confirmed) {
      this.deleteExpense();
    }
  }


  // ------------------------------------------------------ IMAGE PREVIEW LOGIC ------------------------------------------------------
  openImagePreview(img: string) {
    if (!img) return;
    this.previewImage = img;
    this.showImagePreview = true;
  }

  closeImagePreview() {
    this.showImagePreview = false;
    this.previewImage = '';
  }


  // ------------------------------------------------------Service Calls (Initialization)------------------------------------------------------
  getRejectionReason() {
    this.expenseService.fetchRejectionReasons().subscribe(res => {
      this.rejectionReasons = res.data
      console.log("Rejection Reasons", res.data);
    });
  }

  getImagePath() {
    if (!this.expense?.bill_paths || this.expense.bill_paths.length === 0) {
      this.imagePaths = [];
      return;
    }

    // HANDLE BOTH string AND array
    const paths = Array.isArray(this.expense.bill_paths)
      ? this.expense.bill_paths
      : [this.expense.bill_paths];

    this.imagePaths = paths.map((p: string) => {
      const normalized = p?.replace(/\\/g, '/')?.trim();
      return `${this.apiBaseUrl}/${normalized}`;
    });
  }

  getCategories(): string {
    return this.expense?.expense_items
      ?.map((i: any) => i.category)
      .join(', ') || '-NA-';
  }


  // getImagePath() {
  //   this.imgName = this.expense.bill_paths.replace("\\", "/");
  //   console.log("Image name now: ", this.imgName);
  //   this.imgPath = this.apiBaseUrl + '/' + this.imgName;
  //   console.log("The IMAGE: ", this.imgPath);
  // }

  fetchCategories() {
    this.sharedService.fetchCategories().subscribe(res => {
      this.categories = res.data || [];
      console.log("Fetched categories: ", this.categories);
    });
  }


  // ------------------------------------------------------Admin Expense Actions------------------------------------------------------
  approveExpense() {
    try {
      console.log("Approve");
      this.body = {
        action: 'approve',
        rejection_reason_id: '',
        rejection_description: ''
      }
      this.expenseService.updateExpenseStatus(this.expense.id, this.body).subscribe(res => {
        console.log("Expense status response: ", res.data);


        this.toastr.success('Expense approved successfully!');
      });

    } catch (error) {
      this.toastr.error('Failed to approve expense!');
    }

  }


  // Confirmation popup for approval
  confirmApprove() {
    const confirmed = window.confirm('Do you want to approve this expense?');

    if (confirmed) {
      this.approveExpense();
    }
  }

  rejectExpense() {
    this.body = {
      action: "reject",
      rejection_reason_id: this.rejectionReasons.find((r: any) => this.selectedRejectionReason === r.name)?.id ?? 0,
      rejection_description: this.rejectionDescription
    }

  }

  submitRejection() {

    this.expenseService.updateExpenseStatus(this.expense.id, this.body).subscribe((res) => {
      console.log("Expense status response: ", res.data);
      this.toastr.info('This Expense has been rejected!');
    });

  }




  // ------------------------------------------------------Employee Expense Actions------------------------------------------------------
  editExpense() {
    this.fetchCategories();

  }

  resubmitExpense() {
    this.populateForm();
  }

  populateForm() {
    const body = {
      category_id: this.selectedCategory === '' ? this.expense.category_id : (this.categories.find((c: any) => c.name === this.selectedCategory)?.id ?? '').toString(),
      amount: this.amount === 0 ? Number(this.expense.amount.replace("INR ", "")) : this.amount,
      description: this.resubmissionDescription === '' ? this.expense.expense : this.resubmissionDescription
    }


    this.expenseService.resubmit(this.expense.id, body).subscribe({
      next: (res) => {
        this.toastr.success('Expense resubmitted successfully!');
        // this.showPopup = true;
        console.log("Expense resubmitted successfully", res.data);
      },
      error: (err) => {
        console.log("Error in resubmission: ", err);
      }
    });

    console.log("String for matting: ", Number(this.expense.amount.replace("INR ", "")));

  }

  // ------------------------------------------------------ Traverse Expense Actions ------------------------------------------------------
  goNext() {
    this.expense = this.expenseService.nextExpense();
    this.getImagePath();
    this.initialChecks();
  }

  goPrevious() {
    this.expense = this.expenseService.previousExpense();
    this.getImagePath();
    this.initialChecks();
  }

  hasNext() {
    return this.expenseService.hasNext();
  }

  hasPrevious() {
    return this.expenseService.hasPrevious();
  }

}
