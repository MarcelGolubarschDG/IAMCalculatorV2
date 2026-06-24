import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { Calculation } from '../interfaces/calculation';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CsvExportServiceService } from '../services/csv-export-service.service';
import { ExcelExportServiceService } from '../services/excel-export-service.service';

@Component({
    selector: 'app-calculation-detail',
    templateUrl: './calculation-detail.component.html',
    styleUrl: './calculation-detail.component.css',
    standalone: false
})
export class CalculationDetailComponent {

  calculations: Calculation | undefined;

  constructor(
    private toastr: ToastrService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private csvService: CsvExportServiceService,
    private excelService: ExcelExportServiceService
  ) {
    route.params.subscribe(() => { this.getCalculation(); });
  }

  goToPage() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.router.navigateByUrl(`/Edit/Calculation/${id}`);
  }

  goBack(): void { this.location.back(); }

  delete() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.apiService.deleteCalculation(id).subscribe({
      next: () => {
        this.toastr.success('Calculation deleted successfully', 'Success');
        this.router.navigate(['/calculation']);
      },
      error: error => {
        console.error('Error deleting calculation:', error);
        this.toastr.error('Failed to delete the calculation', 'Error');
      }
    });
  }

  onExportCSV() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.csvService.exportCsv(id);
  }

  onExportXLSX() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.excelService.exportXlsx(id);
  }

  getCalculation() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id).subscribe(c => { this.calculations = c; });
  }

  trackBySrvIndex(i: number): number { return i; }

  CalculateTargetsystems(): number {
    const tf = this.calculations?.targetsystemsform;
    if (!tf) return 0;
    return (Number(tf.amountMSAD) + Number(tf.amountMSAAD) + Number(tf.amountMSEX) +
            Number(tf.amountMSEXO) + Number(tf.amountMSSP) + Number(tf.amountMSSPO) +
            Number(tf.amountMSTEAMS) + Number(tf.amountFS) + Number(tf.amountSAPAPP) +
            Number(tf.amountLDAP) + Number(tf.amountSTAR));
  }

  CalculateServicelevel(): string {
    switch (this.calculations?.targetsystemsform.servicelevel) {
      case 1: return 'Business Standard';
      case 2: return 'Business Critical';
      default: return '';
    }
  }

  CalculateLicenseOIM(): string {
    switch (this.calculations?.targetsystemsform.licenseOIM) {
      case 1: return 'Standard';
      case 2: return 'Data Governance Edition';
      default: return '';
    }
  }

  CalculateStages(): string {
    switch (this.calculations?.targetsystemsform.stages) {
      case 2: return 'Produktion, Entwicklung';
      case 3: return 'Produktion, Qualitätssicherung, Entwicklung';
      default: return '';
    }
  }

  CalculateSAPHCM(): string {
    return this.calculations?.targetsystemsform.SAPHCM ? 'Ja' : 'Nein';
  }

  CalculateSAPHCMCSV(): string {
    return this.calculations?.targetsystemsform.SAPHCMCSV ? 'Ja' : 'Nein';
  }

  CalculateServer(): number | undefined {
    return this.calculations?.servers.length;
  }
}
