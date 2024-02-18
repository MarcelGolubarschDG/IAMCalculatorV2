import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCalculationDetailComponent } from './new-calculation-detail.component';

describe('NewCalculationDetailComponent', () => {
  let component: NewCalculationDetailComponent;
  let fixture: ComponentFixture<NewCalculationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewCalculationDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewCalculationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
