import { Component, OnInit } from '@angular/core';
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
export class CalculationDetailComponent implements OnInit {

calculations: Calculation | undefined;

servicelevel: string = ""
stages: string = ""
licenseOIM: string = ""
SAPHCM: string = ""
SAPHCMCSV: string = ""

constructor(
  private toastr: ToastrService,
  private apiService: ApiService,
  private route: ActivatedRoute,
  private router: Router,
  private location: Location,
  private csvService: CsvExportServiceService,
  private excelService: ExcelExportServiceService
  ) {
    route.params.subscribe(val => {
    // put the code from `ngOnInit` here
    this.getCalculation()
  }); }

  ngOnInit(): void {
  }

  // nagivate fuction
  goToPage() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.router.navigateByUrl(`/Edit/Calculation/${id}`)
  }
  
  goBack(): void {
    this.location.back();
  }

  delete() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    console.log('Attempting to delete calculation with ID:', id); // Ausgabe der ID
  
    this.apiService.deleteCalculation(id).subscribe(
      response => {
        console.log('Delete response:', response);
        this.toastr.success('Calculation deleted successfully', 'Success'); // Erfolgsnachricht
        // Weiterleitung nach dem Löschen, z.B. auf eine Liste von Berechnungen
        this.router.navigate(['/calculation']);
      },
      error => {
        console.error('Error deleting calculation:', error);
        this.toastr.error('Failed to delete the calculation', 'Error'); // Fehlermeldung
      }
    );
  }

  onExportCSV(){
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.csvService.exportCsv(id)
  }
  onExportXLSX(){
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.excelService.exportXlsx(id)
  }

  getCalculation() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id)
    .subscribe(calculations => this.calculations = calculations);
  }

  CalculateTargetsystems() {
    let result = Number(this.calculations?.targetsystemsform.amountMSAD)
               + Number(this.calculations?.targetsystemsform.amountMSAAD)
               + Number(this.calculations?.targetsystemsform.amountMSEX)
               + Number(this.calculations?.targetsystemsform.amountMSEXO)
               + Number(this.calculations?.targetsystemsform.amountMSSP)
               + Number(this.calculations?.targetsystemsform.amountMSSPO)
               + Number(this.calculations?.targetsystemsform.amountMSTEAMS)
               + Number(this.calculations?.targetsystemsform.amountFS)
               + Number(this.calculations?.targetsystemsform.amountSAPAPP)
               + Number(this.calculations?.targetsystemsform.amountLDAP)
               + Number(this.calculations?.targetsystemsform.amountSTAR)
    return result
  }

  CalculateServicelevel() {
    switch(this.calculations?.targetsystemsform.servicelevel) {
      case 1:
        this.servicelevel = "Business Standard"
        break;
      case 2:
        this.servicelevel = "Business Critical"
        break;
      case 3:
        this.servicelevel = "Business Critical +"
        break;
      default:
    }
    return this.servicelevel
  }
  
  CalculateLicenseOIM() {
    switch(this.calculations?.targetsystemsform.licenseOIM) {
      case 1:
        this.licenseOIM = "Standard"
        break;
      case 2:
        this.licenseOIM = "Data Governance Edition"
        break;
      default:
    }
    return this.licenseOIM
  }

  CalculateStages() {
    switch(this.calculations?.targetsystemsform.stages) {
      case 2:
        this.stages = "Produktion, Entwicklung"
        break;
      case 3:
        this.stages = "Produktion, Qualitätssicherung, Entwicklung"
        break;
      default:
    }
    return this.stages
  }

  CalculateSAPHCM() {
    switch(this.calculations?.targetsystemsform.SAPHCM) {
      case true:
        this.SAPHCM = "Ja"
        break;
      case false:
        this.SAPHCM = "Nein"
        break;
      default:
    }
    return this.SAPHCM
  }

  CalculateSAPHCMCSV() {
    switch(this.calculations?.targetsystemsform.SAPHCMCSV) {
      case true:
        this.SAPHCMCSV = "Ja"
        break;
      case false:
        this.SAPHCMCSV = "Nein"
        break;
      default:
    }
    return this.SAPHCMCSV
  }

  

  CalculateServer() {
    
    return this.calculations?.servers.length
  }

}
