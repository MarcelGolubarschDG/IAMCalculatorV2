import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Calculation } from '../interfaces/calculation';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators} from '@angular/forms';

@Component({
  selector: 'app-edit-calculation-detail',
  templateUrl: './edit-calculation-detail.component.html',
  styleUrl: './edit-calculation-detail.component.css'
})
export class EditCalculationDetailComponent implements OnInit{
  @Input() calculations: Calculation | undefined;

  constructor(
    private toastr: ToastrService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
    ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
      //this.getCalculation()
      this.loadForm()
      
  }

  // nagivate fuction
  goToPage(value:any) {
    this.router.navigateByUrl(value)
  }
  
  //ngsubmit function
  onSubmit(data: any) {
    //console.log(this.EditCalcForm.value);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    
    var int_calculationID:number = id

    var string_basic_calculationName = JSON.stringify(data.basicform.calculationName).replaceAll('"', '')
    var string_basic_calculationDesc = JSON.stringify(data.basicform.calculationDesc).replaceAll('"', '')
    var string_customer_customerName = JSON.stringify(data.customerform.customerName).replaceAll('"', '')
    var int_customer_customerNumber = parseInt(data.customerform.customerNumber)
    var int_customer_customerInternalEmployees = parseInt(data.customerform.customerInternalEmployees)
    var int_customer_customerExternalEmployees = parseInt(data.customerform.customerExternalEmployees)
    var string_marketunit_marketunitName = JSON.stringify(data.marketunitform.marketunitName).replaceAll('"', '')
    var string_marketunit_marketunitResponsible = JSON.stringify(data.marketunitform.marketunitResponsible).replaceAll('"', '')
    var int_targetsystems_stages = parseInt(data.targetsystemsform.stages)
    var int_targetsystems_DedSrv = data.targetsystemsform.dedicatedSrv
    var int_targetsystems_licenseOIM = parseInt(data.targetsystemsform.licenseOIM)
    var int_targetsystems_servicelevel = parseInt(data.targetsystemsform.servicelevel)
    var int_targetsystems_amountMSAD = parseInt(data.targetsystemsform.amountMSAD)
    var int_targetsystems_amountMSAAD = parseInt(data.targetsystemsform.amountMSAAD)
    var int_targetsystems_amountMSEX = parseInt(data.targetsystemsform.amountMSEX)
    var int_targetsystems_amountMSEXO = parseInt(data.targetsystemsform.amountMSEXO)
    var int_targetsystems_amountMSSP = parseInt(data.targetsystemsform.amountMSSP)
    var int_targetsystems_amountMSSPO = parseInt(data.targetsystemsform.amountMSSPO)
    var int_targetsystems_amountMSTEAMS = parseInt(data.targetsystemsform.amountMSTEAMS)
    var int_targetsystems_amountFS = parseInt(data.targetsystemsform.amountFS)
    var int_targetsystems_amountSAPHCMCSV = parseInt(data.targetsystemsform.amountSAPHCMCSV)
    var int_targetsystems_amountSAPHCM = parseInt(data.targetsystemsform.amountSAPHCM)
    var int_targetsystems_amountSAPAPP = parseInt(data.targetsystemsform.amountSAPAPP)
    var int_targetsystems_amountSTAR = parseInt(data.targetsystemsform.amountSTAR)
    var string_targetsystems_cloudProducts = JSON.stringify(data.targetsystemsform.cloudProducts).replaceAll('"', '')
    var int_targetsystems_amountLDAP = parseInt(data.targetsystemsform.amountLDAP)
    var servers = (data.servers)

    var jsonObjectSrv = JSON.stringify(
    {
      "id": int_calculationID,
      "basicform": {
        "calculationName": string_basic_calculationName,
        "calculationDesc": string_basic_calculationDesc
      },
      "customerform": {
        "customerName": string_customer_customerName,
        "customerNumber": int_customer_customerNumber,
        "customerInternalEmployees": int_customer_customerInternalEmployees,
        "customerExternalEmployees": int_customer_customerExternalEmployees
      },
      "marketunitform": {
        "marketunitName": string_marketunit_marketunitName,
        "marketunitResponsible": string_marketunit_marketunitResponsible
      },
      "targetsystemsform": {
        "licenseOIM": int_targetsystems_licenseOIM,
        "servicelevel": int_targetsystems_servicelevel,
        "stages": int_targetsystems_stages,
        "dedicatedSrv": int_targetsystems_DedSrv,
        "amountMSAD": int_targetsystems_amountMSAD,
        "amountMSAAD": int_targetsystems_amountMSAAD,
        "amountMSEX": int_targetsystems_amountMSEX,
        "amountMSEXO": int_targetsystems_amountMSEXO,
        "amountMSSP": int_targetsystems_amountMSSP,
        "amountMSSPO": int_targetsystems_amountMSSPO,
        "amountMSTEAMS": int_targetsystems_amountMSTEAMS,
        "amountFS": int_targetsystems_amountFS,
        "amountSAPHCMCSV": int_targetsystems_amountSAPHCMCSV,
        "amountSAPHCM": int_targetsystems_amountSAPHCM,
        "amountSAPAPP": int_targetsystems_amountSAPAPP,
        "amountLDAP": int_targetsystems_amountSTAR,
        "amountSTAR": int_targetsystems_amountLDAP,
        "cloudProducts": string_targetsystems_cloudProducts
      },
      "servers": servers

    })
    
    this.apiService.updateCalculation(jsonObjectSrv, id)

  }

  /*getCalculation() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id)
    .subscribe(
      calculation => this.calculations = calculation
    )
  }*/

  loadForm() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id)
    .subscribe(
      calculation => this.EditCalcForm.patchValue({
                                                    basicform: {
                                                      calculationName: calculation.basicform.calculationName,
                                                      calculationDesc: calculation.basicform.calculationDesc,
                                                    },
                                                    customerform: {
                                                      customerName: calculation.customerform.customerName,
                                                      customerNumber: calculation.customerform.customerNumber,
                                                      customerInternalEmployees: calculation.customerform.customerInternalEmployees,
                                                      customerExternalEmployees: calculation.customerform.customerInternalEmployees,
                                                    },
                                                    marketunitform: {
                                                      marketunitName: calculation.marketunitform.marketunitName,
                                                      marketunitResponsible: calculation.marketunitform.marketunitResponsible,
                                                    },
                                                    targetsystemsform: {
                                                      servicelevel: calculation.targetsystemsform.servicelevel,
                                                      licenseOIM: calculation.targetsystemsform.licenseOIM,
                                                      stages: calculation.targetsystemsform.stages,
                                                      dedicatedSrv: calculation.targetsystemsform.dedicatedSrv,
                                                      dedicatedSQLSrv: calculation.targetsystemsform.dedicatedSQLSrv,
                                                      antivirSrv: calculation.targetsystemsform.antivirSrv,
                                                      amountMSAD: calculation.targetsystemsform.amountMSAD,
                                                      amountMSAAD: calculation.targetsystemsform.amountMSAAD,
                                                      amountMSEX: calculation.targetsystemsform.amountMSEX,
                                                      amountMSEXO: calculation.targetsystemsform.amountMSEXO,
                                                      amountMSSP: calculation.targetsystemsform.amountMSSP,
                                                      amountMSSPO: calculation.targetsystemsform.amountMSSPO,
                                                      amountMSTEAMS: calculation.targetsystemsform.amountMSTEAMS,
                                                      amountFS: calculation.targetsystemsform.amountFS,
                                                      amountSAPAPP: calculation.targetsystemsform.amountSAPAPP,
                                                      amountSAPHCMCSV: calculation.targetsystemsform.SAPHCMCSV,
                                                      amountSAPHCM: calculation.targetsystemsform.SAPHCM,
                                                      amountLDAP: calculation.targetsystemsform.amountLDAP,
                                                      amountSTAR: calculation.targetsystemsform.amountSTAR,
                                                      cloudProducts: calculation.targetsystemsform.cloudProducts,
                                                    },
                                                    servers: calculation.servers.forEach((x: { id: any; role: any; stage: any; size: any; cpu: any; addCPU: any; ram: any; addRAM: any; storage: any; addStorage: any; backupstorage: any; addBackupstorage: any; }) => {
                                                      const control = new FormGroup({
                                                        id: new FormControl(x.id, []),
                                                        role: new FormControl(x.role, []),
                                                        stage: new FormControl(x.stage,  []),
                                                        size: new FormControl(x.size,  []),
                                                        cpu: new FormControl(x.cpu,  []),
                                                        addCPU: new FormControl(x.addCPU,  []),
                                                        ram: new FormControl(x.ram,  []),
                                                        addRAM: new FormControl(x.addRAM,  []),
                                                        storage: new FormControl(x.storage,  []),
                                                        addStorage: new FormControl(x.addStorage,  []),
                                                        backupstorage: new FormControl(x.backupstorage,  []),
                                                        addBackupstorage: new FormControl(x.addBackupstorage,  []),
                                                      });
                                                      (<FormArray>this.EditCalcForm.get('servers')).push(control);
                                                      console.log(this.EditCalcForm.get('servers'))
                                                    })
      })
    )
  }

  onPutForm(data: any, id: number) {
    this.apiService.updateCalculation(data, id)
  }

  checkSAPHCM(formvalue:any){
    if (formvalue){
      this.optionValueSAPHCMCSV = false
    }
  }

  checkSAPHCMCSV(formvalue:any){
    if (formvalue){
      this.optionValueSAPHCM = false
    }
  }

  get serversArr() {
    return this.EditCalcForm.get("servers") as FormArray;
  }

  optionValueSAPHCMCSV = false;
  optionValueSAPHCM = false;
  
  EditCalcForm : FormGroup = new FormGroup({
    id: new FormControl(Number(this.route.snapshot.paramMap.get('id'))),
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
    targetsystemsform: new FormGroup({
      servicelevel: new FormControl(null, []),
      licenseOIM: new FormControl(null, []),
      stages: new FormControl(null, []),
      dedicatedSrv: new FormControl(null, []),
      dedicatedSQLSrv: new FormControl(null, []),
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
    }),
    servers: new FormArray([])
  });

}
