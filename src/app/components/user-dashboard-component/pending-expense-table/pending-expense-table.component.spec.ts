import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingExpenseTableComponent } from './pending-expense-table.component';

describe('PendingExpenseTableComponent', () => {
  let component: PendingExpenseTableComponent;
  let fixture: ComponentFixture<PendingExpenseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingExpenseTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingExpenseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
