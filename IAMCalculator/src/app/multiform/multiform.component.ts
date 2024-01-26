import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup} from '@angular/forms';
import { Calculation } from '../interfaces/calculation';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { InMemoryDataService } from '../in-memory-data.service';

@Component({
  selector: 'app-multiform',
  templateUrl: './multiform.component.html',
  styleUrl: './multiform.component.css'
})

export class MultiformComponent implements OnInit{


  constructor(
    private fb: FormBuilder,
    public apiservice: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public db: InMemoryDataService
    ) {}
    

  // init
  ngOnInit(): void {
    this.initForm()
  }

  // nagivate fuction
  goToPage(value:any) {
    this.router.navigateByUrl(value)
  }

  // Zielsystem Variables 
  //Hidden Variables
  isHiddenMSAD=true; 
  isHiddenMSAAD=true; 
  isHiddenMSEX=true; 
  isHiddenMSEXO=true; 
  isHiddenMSSP=true; 
  isHiddenMSSPO=true;
  isHiddenMSTEAMS=true;
  isHiddenFS=true;
  isHiddenSAPHCMCSV=true;
  isHiddenSAPHCM=true;
  isHiddenSAPAPP=true;
  isHiddenLDAP=true;
  isHiddenSTAR=true;
  
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

  // License Form Functions
  toggleMSAD(){
    this.isHiddenMSAD=!this.isHiddenMSAD;
  }
  toggleMSAAD(){
    this.isHiddenMSAAD=!this.isHiddenMSAAD;
  }
  toggleMSEX(){
    this.isHiddenMSEX=!this.isHiddenMSEX;
  }
  toggleMSEXO(){
    this.isHiddenMSEXO=!this.isHiddenMSEXO;
  }
  toggleMSSP(){
    this.isHiddenMSSP=!this.isHiddenMSSP;
  }
  toggleMSSPO(){
    this.isHiddenMSSPO=!this.isHiddenMSSPO;
  }
  toggleMSTEAMS(){
    this.isHiddenMSTEAMS=!this.isHiddenMSTEAMS;
  }
  toggleFS(){
    this.isHiddenFS=!this.isHiddenFS;
    if(this.isHiddenFS)
    {
      this.optionValueOIM = 1;
    }
    else
    {
      this.optionValueOIM = 2;
    }
  }
  toggleSAPHCMCSV(){
    this.isHiddenSAPHCMCSV=!this.isHiddenSAPHCMCSV;
  }
  toggleSAPHCM(){
    this.isHiddenSAPHCM=!this.isHiddenSAPHCM;
  }
  toggleSAPAPP(){
    this.isHiddenSAPAPP=!this.isHiddenSAPAPP;
  }
  toggleLDAP(){
    this.isHiddenLDAP=!this.isHiddenLDAP;
  }
  toggleSTAR(){
    this.isHiddenSTAR=!this.isHiddenSTAR;
  }


  // Variables and Arrays
  // Form Variables
  NewCalculation !: FormGroup;
  calculations: Calculation[] = [];
  isLinear = false;

  
  // Hardware Form Functions
  get basicform(){
    return this.NewCalculation.get("basic") as FormGroup;
  }
  get customerform(){
    return this.NewCalculation.get("customer") as FormGroup;
  }
  get marketunitform(){
    return this.NewCalculation.get("marketunit") as FormGroup;
  }
  get targetsystemform(){
    return this.NewCalculation.get("targetsystems") as FormGroup;
  }
  get finishform(){
    return this.NewCalculation.get("finished") as FormGroup;
  }

  // initialize form
  private initForm() {
    this.NewCalculation = this.fb.group({
      id:this.fb.control(''),
      basic: this.fb.group({
        calculationName:this.fb.control(''),
        calculationDesc:this.fb.control('')
      }),
      customer: this.fb.group({
        customerName:this.fb.control(''),
        customerNumber:this.fb.control(''),
        customerInternalEmployees:this.fb.control('', Validators.pattern('^[0-9]{0,5}$')),
        customerExternalEmployees:this.fb.control('', Validators.pattern('^[0-9]{0,5}$'))
      }),
      marketunit: this.fb.group({
        marketunitName:this.fb.control(''),
        marketunitResponsible:this.fb.control('', Validators.pattern('^(.*)(@datagroup.de)$'))
      }),
      targetsystems: this.fb.group({
        licenseOIM:this.fb.control(''),
        servicelevel:this.fb.control(''),
        stages:this.fb.control(''),
        dedicatedSrv:this.fb.control(''),
        antivirSrv:this.fb.control(''),
        amountMSAD:this.fb.control(''),
        amountMSAAD:this.fb.control(''),
        amountMSEX:this.fb.control(''),
        amountMSEXO:this.fb.control(''),
        amountMSSP:this.fb.control(''),
        amountMSSPO:this.fb.control(''),
        amountMSTEAMS:this.fb.control(''),
        amountFS:this.fb.control(''),
        amountSAPHCMCSV:this.fb.control(''),
        amountSAPHCM:this.fb.control(''),
        amountSAPAPP:this.fb.control(''),
        amountLDAP:this.fb.control(''),
        amountSTAR:this.fb.control(''),
        cloudProducts:this.fb.control('')
      })
    });
  }

  

  postMultiform(formdata : Calculation): void
  {
    this.apiservice.addCalculation(formdata as Calculation)
      .subscribe(result => {
        this.calculations.push(result);
      });
    this.goToPage('/Home')
  }

}
