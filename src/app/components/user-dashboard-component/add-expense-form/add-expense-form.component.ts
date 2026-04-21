import { Component, ViewChild, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthServiceService } from '../../../service/auth-service.service';
import { ExpensesService } from '../../../service/expenses.service';
import { SharedServicesService } from '../../../service/shared-services.service';
import { VisitsService } from '../../../service/visits.service';

import { CategoryOption } from '../../shared/shared/category-options-drop-down-model';
import { VisitsOption } from '../../shared/shared/visits-drop-down';
import { BackButtonComponent } from '../../back-button/back-button.component';

@Component({
  selector: 'app-add-expense-form',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-expense-form.component.html',
  styleUrl: './add-expense-form.component.scss',
})
export class AddExpenseFormComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() expenseCreated = new EventEmitter<void>();

  // ===== STATE =====
  expenseForm!: FormGroup;
  loading = false;

  selectedVisitInfo: any;

  // ✅ MULTI FILE STATE
  selectedFiles: File[] = [];
  filePreviews: string[] = [];

  startDate = '';
  endDate = '';

  // ===== SEARCH DROPDOWN STATE =====
  visitSearch = '';
  filteredVisits: VisitsOption[] = [];
  isVisitDropdownOpen = false;

  // ===== DATA =====
  categories: CategoryOption[] = [];
  activeVisits: VisitsOption[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthServiceService,
    private expensesService: ExpensesService,
    private sharedService: SharedServicesService,
    private visitService: VisitsService,
    private toastr: ToastrService,
  ) {}

  // ===== INIT =====
  ngOnInit() {
    this.expenseFormInit();

    this.fetchVisits();
    this.fetchCategories();

    this.expenseForm.get('selectedVisit')?.valueChanges.subscribe(() => {
      this.onVisitChange();
    });
  }

  // ===== FORM INIT =====
  expenseFormInit() {
    this.expenseForm = this.fb.group({
      selectedCategory: ['', Validators.required],
      selectedVisit: ['', Validators.required],
      date: ['', Validators.required],
      selectedFiles: [[], Validators.required], // ✅ UPDATED
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      receiptNo: ['', Validators.required],
      description: ['']
    });
  }

  // ===== FETCH VISITS =====
  fetchVisits() {
    this.visitService.fetchVisits().subscribe((res) => {
      const allVisits = res.data || [];

      const today = new Date();
      const past90Days = new Date();
      past90Days.setDate(today.getDate() - 90);

      this.activeVisits = allVisits.filter((visit: any) => {
        if (!visit.start_date) return false;

        const visitDate = new Date(visit.start_date);
        return visitDate >= past90Days && visitDate <= today;
      });

      this.filteredVisits = [...this.activeVisits];
    });
  }

  fetchCategories() {
    this.sharedService.fetchCategories().subscribe(res => {
      this.categories = res.data || [];
    });
  }

  // ===== SEARCH FILTER =====
  onVisitSearchChange() {
    const search = this.visitSearch.toLowerCase();

    this.filteredVisits = this.activeVisits.filter(v =>
      v.visit_name.toLowerCase().includes(search)
    );
  }

  // ===== SELECT VISIT =====
  selectVisit(visit: VisitsOption) {
    this.expenseForm.patchValue({
      selectedVisit: visit.visit_name
    });

    this.visitSearch = visit.visit_name;
    this.isVisitDropdownOpen = false;

    this.onVisitChange();
  }

  // ===== CLOSE DROPDOWN =====
  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    const clickedInside = event.target.closest('.visit-dropdown');
    if (!clickedInside) {
      this.isVisitDropdownOpen = false;
    }
  }

  // ===== VISIT CHANGE =====
  onVisitChange() {
    this.selectedVisitInfo = this.activeVisits.find(
      (v) => v.visit_name === this.expenseForm.get('selectedVisit')?.value
    );

    if (!this.selectedVisitInfo) return;

    const visitStart = new Date(this.selectedVisitInfo.start_date);
    const visitEnd = new Date(this.selectedVisitInfo.end_date);
    const today = new Date();

    this.startDate = visitStart.toISOString().split('T')[0];

    const finalEndDate = visitEnd < today ? visitEnd : today;
    this.endDate = finalEndDate.toISOString().split('T')[0];
  }

  // ===== MULTI FILE HANDLER =====
  fileOnChange(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        this.toastr.error('Only image files allowed');
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.filePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    this.expenseForm.patchValue({
      selectedFiles: this.selectedFiles
      
    });
    console.log("Multiple imgs support: ----------------------------", this.selectedFiles);
    console.log("Individual file: ", this.selectedFiles.forEach(s => s.name));
  }

  // ===== REMOVE FILE =====
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);

    this.expenseForm.patchValue({
      selectedFiles: this.selectedFiles
    });

    if (this.selectedFiles.length === 0) {
      this.resetFile();
    }
  }

  // ===== RESET FILE =====
  resetFile() {
    this.selectedFiles = [];
    this.filePreviews = [];

    this.expenseForm.patchValue({ selectedFiles: [] });

    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  // ===== VALIDATION =====
  private showError(message: string): boolean {
    this.toastr.warning(message);
    return false;
  }

  validateForm(): boolean {
    if (!this.expenseForm.get('selectedCategory')?.value) return this.showError('Category is required');
    if (!this.expenseForm.get('selectedVisit')?.value) return this.showError('Visit is required');
    if (!this.expenseForm.get('date')?.value) return this.showError('Date is required');

    const amount = this.expenseForm.get('amount')?.value;
    if (!amount || Number(amount) <= 0) return this.showError('Enter valid amount');

    if (!this.expenseForm.get('receiptNo')?.value) return this.showError('Receipt number is required');

    // ✅ UPDATED
    if (!this.selectedFiles.length) return this.showError('At least one receipt image is required');

    return true;
  }

  // ===== AMOUNT VALIDATION =====
  blockInvalidKeys(event: KeyboardEvent) {
    const invalidKeys = ['-', '+', 'e', 'E'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  // ===== SUBMIT =====
  onSubmit() {
    // if (!this.validateForm()) return;
    console.log("Form valid: ")

    this.loading = true;

    const formValues = this.expenseForm.value;
    const formData = new FormData();

    formData.append(
      'category_id',
      (this.categories.find((c) => c.name === formValues.selectedCategory)?.id ?? '').toString()
    );

    formData.append(
      'visit_id',
      String(
        this.activeVisits.find((v) => v.visit_name === formValues.selectedVisit)?.id ?? 0
      )
    );

    formData.append('date', formValues.date);

    // ✅ MULTI FILE APPEND
    this.selectedFiles.forEach((file) => {
      formData.append('bills', file);
    });

    formData.append('amount', formValues.amount);
    formData.append('receipt_id', `TESTING_${formValues.receiptNo}`);
    formData.append('description', formValues.description || '');

    console.log("FormData entries:");
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
      if (value instanceof File) {  
      }});

    this.expensesService.addExpense(formData).subscribe({
      next: () => {
        this.toastr.success('Expense submitted successfully');
        this.onClear();
        this.loading = false;
        this.expenseCreated.emit();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Something went wrong');
        this.loading = false;
      },
    });
  }

  // ===== CLEAR =====
  onClear() {
    this.expenseForm.reset();

    this.expenseForm.patchValue({
      selectedCategory: '',
      selectedVisit: '',
      selectedFiles: []
    });

    this.visitSearch = '';
    this.filteredVisits = [...this.activeVisits];

    this.startDate = '';
    this.endDate = '';

    this.resetFile();
  }
}