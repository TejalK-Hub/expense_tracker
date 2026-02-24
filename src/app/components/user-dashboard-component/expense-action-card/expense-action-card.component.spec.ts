import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseActionCardComponent } from './expense-action-card.component';

describe('ExpenseActionCardComponent', () => {
  let component: ExpenseActionCardComponent;
  let fixture: ComponentFixture<ExpenseActionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseActionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseActionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
