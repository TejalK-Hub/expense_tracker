import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitsTableComponent } from './visits-table.component';

describe('VisitsTableComponent', () => {
  let component: VisitsTableComponent;
  let fixture: ComponentFixture<VisitsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
