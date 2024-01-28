import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup, FormControl, FormArray} from '@angular/forms';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { Calculation } from '../interfaces/calculation';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-multiform',
  templateUrl: './multiform.component.html',
  styleUrl: './multiform.component.css'
})

export class MultiformComponent implements OnInit{

  constructor(
    public apiservice: ApiService,
    private router: Router,
    private location: Location
    ) {}

  ngOnInit(): void {}
  
  // navigate back function
  goBack(): void {
    this.location.back();
  }

  // nagivate fuction
  goToPage(value:any) {
    this.router.navigateByUrl(value)
  }

  //ngsubmit function
  onSubmit() {
    //console.log(this.matStepperForm.value);
    this.apiservice.addCalculation(this.matStepperForm.value)
    this.matStepperForm.reset();
    this.goToPage('/Overview')
  }

  // Variables and Arrays
  // Form Variables
  calculations: Calculation[] = [];

  matStepperForm : FormGroup = new FormGroup({
    id: new FormControl(null, []),
    basicform: new FormGroup({
      calculationName: new FormControl(null, []),
      calculationDesc: new FormControl(null,[]),
    }),
    customerform: new FormGroup({
      customerName: new FormControl(null, []),
      customerNumber: new FormControl(null,[]),
      customerInternalEmployees: new FormControl(null,[]),
      customerExternalEmployees: new FormControl(null,[]),
    }),
    marketunitform: new FormGroup({
      marketunitName: new FormControl(null, []),
      marketunitResponsible: new FormControl(null,[]),
    }),
    targetsystemform: new FormGroup({
      servicelevel: new FormControl(null, []),
      licenseOIM: new FormControl(null, []),
      stages: new FormControl(null, []),
      dedicatedSrv: new FormControl(null, []),
      antivirSrv: new FormControl(null, []),
      amountMSAD: new FormControl(null, []),
      amountMSAAD: new FormControl(null, []),
      amountMSEX: new FormControl(null, []),
      amountMSEXO: new FormControl(null, []),
      amountMSSP: new FormControl(null, []),
      amountMSSPO: new FormControl(null, []),
      amountMSTEAMS: new FormControl(null, []),
      amountFS: new FormControl(null, []),
      amountSAPAPP: new FormControl(null, []),
      amountSAPHCMCSV: new FormControl(null, []),
      amountSAPHCM: new FormControl(null, []),
      amountLDAP: new FormControl(null, []),
      amountSTAR: new FormControl(null, []),
      cloudProducts: new FormControl(null, [])
    })
  });

  
  optionValueOIM = 1;
  optionValueSLA = 2;
  optionValueStages = 2;
  optionValuededicatedSrv = false;
  optionValueantivirSrv = false
  optionValueMSAD = 0;
  optionValueMSAAD = 0;
  optionValueMSEX = 0;
  optionValueMSEXO = 0;
  optionValueMSSP = 0;
  optionValueMSSPO = 0;
  optionValueMSTEAMS = 0;
  optionValueFS = 0;
  optionValueSAPHCMCSV = 0;
  optionValueSAPHCM = 0;
  optionValueSAPAPP = 0;
  optionValueLDAP = 0;
  optionValueSTAR = 0;
  optionValueCloudProduct = "";

}
