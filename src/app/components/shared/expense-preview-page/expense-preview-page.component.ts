import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpensesService } from '../../../service/expenses.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../../back-button/back-button.component';
import { environment } from '../../../../environments/environment';

import { AuthServiceService } from '../../../service/auth-service.service';
import { VisitsService } from '../../../service/visits.service';
import { SharedServicesService } from '../../../service/shared-services.service';

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

  showImagePreview = false;

  // -------------------------------------------------------Alerts---------------------------------------------------------

  showPopup = false;
  showErrorPopup = false;

  successMessage = '';
  errorMessage = '';

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
  imgName: string = '';
  imgPath!: string;

  // ----------------------------------------------api params------------------------------------------------
  body: any = {};


  constructor(private expenseService: ExpensesService, private router: Router, private authService: AuthServiceService, private sharedService: SharedServicesService, private visitService: VisitsService) { }

  // bill_path:"uploads\\1773641334791.png"



  ngOnInit() {

    this.expense = this.expenseService.getSelectedExpense();
    console.log("Expense Preview: (BEFORE) ", this.expense);

    // this.expense.status = 'nothing';
    // this.expense.expense_date = 'yesterday';

    // console.log("Expense Preview: (AFTER) ", this.expense);

    console.log("Self Admin:: ", this.authService.userId, this.expense.user_id);


    // ------------------------------------------------------Initial Checks------------------------------------------------------

    if (this.authService.userRole?.toLowerCase() == 'admin') {
      this.isAdmin = true;
    }


    if (this.expense.status === 'Rejected') {

      this.isRejected = true;
    }

    if (this.authService.userId === this.expense.user_id) {
      this.isSelfAdmin = false;
    }



    this.getRejectionReason();


    // ------------------------------------------------------Image Preview------------------------------------------------------
    this.getImagePath();




    // If user refreshes page → redirect back safely
    if (!this.expense) {
      this.router.navigate(['/manage-expense']);
    }
  }

  openImagePreview() {
  this.showImagePreview = true;
}

closeImagePreview() {
  this.showImagePreview = false;
}

  // ------------------------------------------------------Service Calls------------------------------------------------------


  getRejectionReason() {
    this.expenseService.fetchRejectionReasons().subscribe(res => {
      this.rejectionReasons = res.data
      console.log("Rejection Reasons", res.data);
    });
  }

  getImagePath() {
    this.imgName = this.expense.bill_path.replace("\\", "/");
    this.imgPath = this.apiBaseUrl + '/' + this.imgName;
    console.log("The IMAGE: ", this.imgPath);
  }

  fetchCategories() {
    this.sharedService.fetchCategories().subscribe(res => {
      this.categories = res.data || [];
      console.log("Fetched categories: ", this.categories);
    });
  }



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


        this.successMessage = 'Expense approved successfully!';
        this.showPopup = true;

        setTimeout(() => {
          this.showPopup = false;
        }, 3000);
      });

    } catch (error) {
      this.errorMessage = 'Failed to approve expense!';
      this.showErrorPopup = true;

      setTimeout(() => {
        this.showErrorPopup = false;
      }, 3000);
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

      this.errorMessage = 'This Expense has been rejected!';
      this.showErrorPopup = true;

      setTimeout(() => {
        this.showErrorPopup = false;
      }, 3000);

    });

  }


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
        this.successMessage = 'Expense resubmitted successfully!';
        this.showPopup = true;
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
