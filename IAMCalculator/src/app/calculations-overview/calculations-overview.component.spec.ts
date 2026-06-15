import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';

import { CalculationsOverviewComponent } from './calculations-overview.component';
import { Calculation } from '../interfaces/calculation';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';

describe('CalculationsOverviewComponent', () => {
  let component: CalculationsOverviewComponent;
  let fixture: ComponentFixture<CalculationsOverviewComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const createCalculation = (id: string, name = 'Testkalkulation'): Calculation => ({
    _id: id,
    basicform: {
      calculationName: name,
      calculationDesc: ''
    },
    customerform: {
      customerName: 'Testkunde',
      customerEmployees: 100
    },
    targetsystemsform: {
      licenseOIM: 0,
      servicelevel: 0,
      stages: 0,
      sizingMode: '',
      SAPHCMCSV: false,
      SAPHCM: false,
      amountMSAD: 0,
      amountMSAAD: 0,
      amountMSEX: 0,
      amountMSEXO: 0,
      amountMSSP: 0,
      amountMSSPO: 0,
      amountMSTEAMS: 0,
      amountFS: 0,
      amountSAPAPP: 0,
      amountLDAP: 0,
      amountSTAR: 0
    },
    servers: []
  });

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', ['getCalculations', 'deleteCalculation']);
    toastrSpy = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'error']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    const locationSpy = jasmine.createSpyObj<Location>('Location', ['back']);

    apiServiceSpy.getCalculations.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [CalculationsOverviewComponent],
      imports: [CommonModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalculationsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete a calculation without navigating from the card', () => {
    const deletedCalculation = createCalculation('1');
    component.calculations = [deletedCalculation, createCalculation('2', 'Weitere Kalkulation')];
    apiServiceSpy.deleteCalculation.and.returnValue(of({ message: 'ok' }));
    spyOn(window, 'confirm').and.returnValue(true);
    const clickEvent = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);

    component.deleteCalculation(deletedCalculation, clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(apiServiceSpy.deleteCalculation).toHaveBeenCalledWith('1');
    expect(component.calculations.map(calculation => calculation._id)).toEqual(['2']);
    expect(toastrSpy.success).toHaveBeenCalledWith('Kalkulation gelöscht', 'Erfolg');
  });

  it('should keep the calculation when delete is cancelled', () => {
    const keptCalculation = createCalculation('1');
    component.calculations = [keptCalculation];
    spyOn(window, 'confirm').and.returnValue(false);
    const clickEvent = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);

    component.deleteCalculation(keptCalculation, clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(apiServiceSpy.deleteCalculation).not.toHaveBeenCalled();
    expect(component.calculations).toEqual([keptCalculation]);
  });
});
