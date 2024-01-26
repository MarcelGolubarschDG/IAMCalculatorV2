import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCalculationDetailComponent } from './edit-calculation-detail.component';

describe('EditCalculationDetailComponent', () => {
  let component: EditCalculationDetailComponent;
  let fixture: ComponentFixture<EditCalculationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCalculationDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCalculationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
