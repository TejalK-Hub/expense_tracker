import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownButtonComponent } from './drop-down-button.component';

describe('DropDownButtonComponent', () => {
  let component: DropDownButtonComponent;
  let fixture: ComponentFixture<DropDownButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropDownButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropDownButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
