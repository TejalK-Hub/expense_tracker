import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../../environments/environment';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { AuthServiceService } from '../../../service/auth-service.service';
import { ExpensesService } from '../../../service/expenses.service';
import { SharedServicesService } from '../../../service/shared-services.service';
import { VisitsService } from '../../../service/visits.service';

@Component({
  selector: 'app-expense-preview-page',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, FormsModule],
  templateUrl: './expense-preview-page.component.html',
  styleUrl: './expense-preview-page.component.scss',
})
export class ExpensePreviewPageComponent {
  expense: any;

  editable: boolean = false;

  isAdmin: boolean = false;

  isSelfAdmin: boolean = true;

  isRejected: boolean = false;

  isDeletable: boolean = false;

  showImagePreview = false;
  
  // ----------------------------------------------modal properties------------------------------------------------
  rejectionReasons: any;
  selectedRejectionReason: string = '';
  rejectionDescription: string = '';


  amount: number = 0;
  categories: any;
  selectedCategory: string = '';
  resubmissionDescription: string = '';


  // ----------------------------------------------modal properties------------------------------------------------
  apiBaseUrl: string = environment.apiBaseUrl;
  // imgName: string = '';
  imagePaths: string[] = [];
  previewImage: string = '';

  // ----------------------------------------------api params------------------------------------------------
  body: any = {};


  constructor(private expenseService: ExpensesService, private router: Router, private authService: AuthServiceService, private sharedService: SharedServicesService, private visitService: VisitsService, private toastr: ToastrService) { }

  // bill_path:"uploads\\1773641334791.png"



  ngOnInit() {

    this.expense = this.expenseService.getSelectedExpense();
    this.initialChecks();
    this.getRejectionReason();
    this.getImagePath();
    this.deletable();
    // If user refreshes page → redirect back safely
    if (!this.expense) {
      console.log("No expense selected, redirecting back to manage expense page.");
      this.router.navigate(['/manage-expense']);
    }

    console.log("Selected expense: ", this.expense);

  }


  // ------------------------------------------------------Initial Checks------------------------------------------------------
  initialChecks() {
    if (this.authService.userRole?.toLowerCase() == 'admin') {
      this.isAdmin = true;
    }

    if (this.expense.status === 'Rejected') {

      this.isRejected = true;
    }

    if (this.authService.userId === this.expense.user_id) {
      this.isSelfAdmin = false;
    }

  }

  deletable() {
    if (this.expense.status === 'Submitted' && !this.expense.approved_at) {
      this.isDeletable = true;
    }
  }


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
    // console.log("Reject");
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
    // console.log("Editable: ",this.selectedCategory);
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


  // printReceipt() {
  //   const content = document.getElementById('receipt')?.innerHTML;

  //   const printWindow = window.open('', '', 'width=800,height=600');

  //   if (printWindow && content) {
  //     printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Receipt</title>
  //         <style>
  //           body {
  //             font-family: Arial, sans-serif;
  //             padding: 20px;
  //           }

  //           .lux-receipt {
  //             max-width: 520px;
  //             margin: auto;
  //           }

  //           img {
  //             max-width: 100%;
  //             height: auto;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="lux-receipt">
  //           ${content}
  //         </div>
  //       </body>
  //     </html>
  //   `);

  //     printWindow.document.close();
  //     printWindow.focus();
  //     printWindow.print();
  //     printWindow.close();
  //   }
  // }
}
