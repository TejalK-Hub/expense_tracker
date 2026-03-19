import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseReviewComponent } from './expense-review.component';

describe('ExpenseReviewComponent', () => {
  let component: ExpenseReviewComponent;
  let fixture: ComponentFixture<ExpenseReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
