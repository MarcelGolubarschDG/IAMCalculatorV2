import { TestBed } from '@angular/core/testing';

import { ExcelExportServiceService } from './excel-export-service.service';

describe('ExcelExportServiceService', () => {
  let service: ExcelExportServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelExportServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
