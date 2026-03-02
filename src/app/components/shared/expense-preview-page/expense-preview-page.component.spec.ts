import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePreviewPageComponent } from './expense-preview-page.component';

describe('ExpensePreviewPageComponent', () => {
  let component: ExpensePreviewPageComponent;
  let fixture: ComponentFixture<ExpensePreviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePreviewPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensePreviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
