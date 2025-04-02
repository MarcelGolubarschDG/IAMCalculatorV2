import { Component, Injectable, OnInit } from '@angular/core';
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
  styleUrl: './calculation-detail.component.css'
})

@Injectable()

export class CalculationDetailComponent implements OnInit {

calculations: Calculation | undefined;

//return variables for converting to human readable output
servicelevel:string = ""
stages:string = ""
licenseOIM:string = ""
antivirSrv: string = ""
dedicatedSrv: string = ""
dedicatedStages: string = ""
SAPHCM: string = ""
SAPHCMCSV: string = ""

// div toggle variables
showMyContainer: boolean = false;

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

  onExportCSV(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.csvService.exportCsv(id)
  }
  onExportXLSX(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.excelService.exportXlsx(id)
  }

  getCalculation() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id)
    .subscribe(calculations => this.calculations = calculations);
  }

  CalculateIdentities() {
    let internal = Number(this.calculations?.customerform.customerEmployees)
    let result = internal
    return result
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
      case 1:
        this.stages = "Produktion, Entwicklung"
        break;
      case 2:
        this.stages = "Produktion, Qualitätssicherung, Entwicklung"
        break;
      default:
    }
    return this.stages
  }

  CalculateDedicatedSrv() {
    switch(this.calculations?.targetsystemsform.dedicatedSrv) {
      case true:
        this.dedicatedSrv = "Ja"
        break;
      case false:
        this.dedicatedSrv = "Nein"
        break;
      default:
    }
    return this.dedicatedSrv
  }

  CalculateDedicatedStages() {
    switch(this.calculations?.targetsystemsform.dedicatedStages) {
      case true:
        this.dedicatedStages = "Ja"
        break;
      case false:
        this.dedicatedStages = "Nein"
        break;
      default:
    }
    return this.dedicatedStages
  }

  CalculateAntivirSrv() {
    switch(this.calculations?.targetsystemsform.antivirSrv) {
      case true:
        this.antivirSrv = "Ja"
        break;
      case false:
        this.antivirSrv = "Nein"
        break;
      default:
    }
    return this.antivirSrv
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


}
