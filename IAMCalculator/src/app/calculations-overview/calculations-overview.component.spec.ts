import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationsOverviewComponent } from './calculations-overview.component';

describe('CalculationsOverviewComponent', () => {
  let component: CalculationsOverviewComponent;
  let fixture: ComponentFixture<CalculationsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculationsOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalculationsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
