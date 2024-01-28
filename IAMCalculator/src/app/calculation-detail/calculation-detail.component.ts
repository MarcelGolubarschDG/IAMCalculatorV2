import { Component, Injectable, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { Calculation } from '../interfaces/calculation';
import { Server } from '../interfaces/server';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

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

// div toggle variables
showMyContainer: boolean = false;

constructor(
  private toastr: ToastrService,
  private apiService: ApiService,
  private route: ActivatedRoute,
  private router: Router,
  private location: Location
  ) {
    route.params.subscribe(val => {
    // put the code from `ngOnInit` here
    this.getCalculation()
  }); }

  ngOnInit(): void {
  }

  // nagivate fuction
  goToPage(value:any) {
    this.router.navigateByUrl(value)
  }
  
  goBack(): void {
    this.location.back();
  }

  getCalculation() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id)
    .subscribe(calculations => this.calculations = calculations);
  }

  CalculateIdentities() {
    let internal = Number(this.calculations?.customerform.customerInternalEmployees)
    let external = Number(this.calculations?.customerform.customerExternalEmployees)
    let result = internal + external
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
               + Number(this.calculations?.targetsystemsform.amountSAPHCMCSV)
               + Number(this.calculations?.targetsystemsform.amountSAPHCM)
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

  // get servercount from array server for specific calcid ### source https://www.freecodecamp.org/news/how-to-count-objects-in-an-array/
  amountOfServerByCalcID() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    let counter = 0;
    for (let i = 0; i < this.calculations?.servers.length; i++) {
      if (this.calculations?.servers[i].calculationID === id) counter++;
    }
    return counter
  }

}
