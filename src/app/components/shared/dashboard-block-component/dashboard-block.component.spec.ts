import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBlockComponent } from './dashboard-block.component';

describe('DashboardBlockComponent', () => {
  let component: DashboardBlockComponent;
  let fixture: ComponentFixture<DashboardBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
