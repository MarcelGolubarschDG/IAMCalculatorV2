import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators} from '@angular/forms';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { Calculation } from '../interfaces/calculation';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-calculation-detail',
  templateUrl: './new-calculation-detail.component.html',
  styleUrl: './new-calculation-detail.component.css'
})

export class NewCalculationDetailComponent implements OnInit{

  calculations: Calculation[] = [];

  get serverControls() {
    return (this.NewCalcForm.get('servers') as FormArray).controls;
  }

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
    //console.log(this.NewCalcForm.value);
    this.onPostForm(this.NewCalcForm.value)
    this.NewCalcForm.reset()
    this.goToPage('/Overview')
  }

  onPostForm(data: any) {
    this.apiservice.addCalculation(data)
  }

  checkFS(formvalue:any){
    if (formvalue != "0")
    {
      this.optionValueOIM = 2
      this.disabledLicense = true
      console.log('if')
    }else{
      this.optionValueOIM = 1
      this.disabledLicense = false
      console.log('else')
    }
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

  calcServerSize(data: any){

    // Clear FormArray Servers
    while ((<FormArray>this.NewCalcForm.get('servers')).length !== 0) {
      (<FormArray>this.NewCalcForm.get('servers')).removeAt(0)
    }

    /** convert from string to expected type */
    var int_targetsystems_stages = parseInt(data.targetsystemsform.stages)
    var int_targetsystems_amountMSAD = parseInt(data.targetsystemsform.amountMSAD)
    var int_targetsystems_amountMSAAD = parseInt(data.targetsystemsform.amountMSAAD)
    var int_targetsystems_amountMSEX = parseInt(data.targetsystemsform.amountMSEX)
    var int_targetsystems_amountMSEXO = parseInt(data.targetsystemsform.amountMSEXO)
    var int_targetsystems_amountMSSP = parseInt(data.targetsystemsform.amountMSSP)
    var int_targetsystems_amountMSSPO = parseInt(data.targetsystemsform.amountMSSPO)
    var int_targetsystems_amountMSTEAMS = parseInt(data.targetsystemsform.amountMSTEAMS)
    var int_targetsystems_amountFS = parseInt(data.targetsystemsform.amountFS)
    var bool_targetsystems_amountSAPHCMCSV = Boolean(data.targetsystemsform.amountSAPHCMCSV)
    var bool_targetsystems_amountSAPHCM = Boolean(data.targetsystemsform.amountSAPHCM)
    var int_targetsystems_amountSAPAPP = parseInt(data.targetsystemsform.amountSAPAPP)
    var int_targetsystems_amountSTAR = parseInt(data.targetsystemsform.amountSTAR)
    var int_targetsystems_amountLDAP = parseInt(data.targetsystemsform.amountLDAP)
    var int_targetsystems_dedicatedSrv = Boolean(data.targetsystemsform.dedicatedSrv)
    var int_targetsystems_dedicatedSQLSrv = Boolean(data.targetsystemsform.dedicatedSQLSrv)

    // Berechnung Anzahl Zielsysteme
    var stages:number = int_targetsystems_stages
    var amountSAPHCM:number = 0
    var amountMSAD:number = int_targetsystems_amountMSAD
    var amountMSAAD:number = int_targetsystems_amountMSAAD
    var amountMSEX:number = int_targetsystems_amountMSEX
    var amountMSEXO:number = int_targetsystems_amountMSEXO
    var amountMSSP:number = int_targetsystems_amountMSSP
    var amountMSSPO:number = int_targetsystems_amountMSSPO
    var amountMSTEAMS:number = int_targetsystems_amountMSTEAMS
    var amountFS:number = int_targetsystems_amountFS
    var amountSAPAPP:number = int_targetsystems_amountSAPAPP
    var amountLDAP:number = int_targetsystems_amountLDAP
    var amountSTAR:number = int_targetsystems_amountSTAR
    var dedicatedSrv:boolean = int_targetsystems_dedicatedSrv
    var dedicatedSQLSrv:boolean = int_targetsystems_dedicatedSQLSrv

    // Berechnung Identitäten
    var amountIdentities:number
    var amountIdentitiesInternal:number = parseInt(data.customerform.customerInternalEmployees)
    var amountIdentitiesExternal:number = parseInt(data.customerform.customerExternalEmployees)
    amountIdentities = amountIdentitiesInternal + amountIdentitiesExternal

    // Berechnung SLA
    var servicelevel:number = parseInt(data.targetsystemsform.servicelevel)

    // Berechnung Zielsysteme
    var amountOtherTargetsystems:number = 0
    var amountMSTargetsystems:number = 0
    var amountSAPTargetsystems:number = 0
    var amountTargetsystem:number = amountOtherTargetsystems + amountMSTargetsystems + amountSAPTargetsystems

    // Berechnung aller benötigter Server
    var amountDCQS:number = 0
    var amountDCDEV:number = 0
    var amountJobServerQS:number = 0
    var amountJobServerDEV:number = 0
    var amountJobServerProd:number = 0
    var amountWebServerProd:number = 0
    var amountDBServerProd:number = 0
    var amountDBServerQS:number = 0
    var amountDBServerDEV:number = 0

    // SAP Server Berechnung Prod
    if (bool_targetsystems_amountSAPHCMCSV || bool_targetsystems_amountSAPHCM){ amountSAPHCM = 1 }
    
    // DB Server Berechnung Prod
    switch (true)
    {
      // Business Standard
      case servicelevel == 1 || servicelevel == 2:
        amountDBServerProd = 1
      break;
      // Business Critical Plus
      case servicelevel == 3:
        amountDBServerProd = 2
      break;
    }

    // Web Server Berechnung Prod
    switch (true)
    {
      // < 2500 Identitäten # 1 L
      case amountIdentities < 2500:
        amountWebServerProd = 1
      break;
      // > 2499 Identitäten < 5001 Identitäten # 1 XL
      case amountIdentities > 2499 && amountIdentities < 5000:
        amountWebServerProd = 1
      break;
      // >= 5000 Identitäten < 8500 # 2 L
      case amountIdentities >= 5000 && amountIdentities < 5000:
        amountWebServerProd = 2
      break;
      // B> 8500 Identitäten # 2 XL
      case amountIdentities >= 8500:
        amountWebServerProd = 2
      break;
    }

    // Job Server Berechnung Prod
    switch (true)
    {
      // dedizierte Server
      case dedicatedSrv == true:
        amountOtherTargetsystems = Math.ceil((amountFS+amountLDAP+amountSTAR) / 5)
        amountMSTargetsystems = Math.ceil((amountMSAD+amountMSAAD+amountMSEX+amountMSEXO+amountMSSP+amountMSSPO+amountMSTEAMS) / 3)
        amountSAPTargetsystems = Math.ceil((amountSAPHCM + amountSAPAPP) / 6)
      break;
      // keine dedizierte Server / 10 Pro Job Server
      case dedicatedSrv != true:
        amountOtherTargetsystems = Math.ceil((amountFS+amountLDAP+amountSTAR))
        amountMSTargetsystems = Math.ceil((amountMSAD+amountMSAAD+amountMSEX+amountMSEXO+amountMSSP+amountMSSPO+amountMSTEAMS))
        amountSAPTargetsystems = Math.ceil((amountSAPHCM + amountSAPAPP))
        amountJobServerProd = Math.ceil((amountOtherTargetsystems + amountMSTargetsystems + amountSAPTargetsystems) / 10)
      break;
    }

    // Job Server Berechnung DEV QS
    switch (true)
    {
      // dedizierte Server
      case stages == 1 && dedicatedSQLSrv:
        amountDCQS = 0
        amountDCDEV = 1
        amountJobServerQS = 0
        amountJobServerDEV = 1
        amountDBServerQS = 0
        amountDBServerDEV = 1
      break;
      // keine dedizierte Server / 10 Pro Job Server
      case stages == 2 && dedicatedSQLSrv:
        amountDCQS = 1
        amountDCDEV = 1
        amountJobServerQS = 1
        amountJobServerDEV = 1
        amountDBServerQS = 1
        amountDBServerDEV = 1
      break;
      // keine dedizierte Server / 10 Pro Job Server
      case stages == 1 && !dedicatedSQLSrv:
        amountDCQS = 0
        amountDCDEV = 1
        amountJobServerQS = 0
        amountJobServerDEV = 1
        amountDBServerQS = 0
        amountDBServerDEV = 0
      break;
      // keine dedizierte Server / 10 Pro Job Server
      case stages == 2 && !dedicatedSQLSrv:
        amountDCQS = 1
        amountDCDEV = 1
        amountJobServerQS = 1
        amountJobServerDEV = 1
        amountDBServerQS = 0
        amountDBServerDEV = 0
      break;
    }
    
    //Baue Prod Server
    switch (true)
    {
      // dedizierte Server
      case dedicatedSrv == true:
        //Baue PROD DB Server
        for (var i = 1; i <= amountDBServerProd; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "DB"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
        //Baue PROD Web Server
        for (var i = 1; i <= amountWebServerProd; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "Web"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
        //Baue PROD MS Job Server
        for (var i = 1; i <= amountMSTargetsystems; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "MS Job"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
        //Baue PROD SAP Job Server
        for (var i = 1; i <= amountSAPTargetsystems; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "SAP Job"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
        //Baue PROD Other Job Server
        for (var i = 1; i <= amountOtherTargetsystems; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "Generic Job"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
      break;
      // dedizierte Server
      case dedicatedSrv == false:
        //Baue PROD DB Server
        for (var i = 1; i <= amountDBServerProd; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "DB"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
        //Baue PROD Web Server
        for (var i = 1; i <= amountWebServerProd; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "Web"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
        //Baue PROD DB Server
        for (var i = 1; i <= amountJobServerProd; i++){
          string_stage = "Prod"
          string_size = "XL"
          string_role = "Job"
          int_cpu = 8
          int_ram = 32
          int_sto = 0
          int_bsto = 0
          int_addcpu = 0
          int_addram = 0
          int_addsto = 50
          int_addbsto = 100

          const control = new FormGroup({
            id: new FormControl(null, []),
            role: new FormControl(string_role, []),
            stage: new FormControl(string_stage,  []),
            size: new FormControl(string_size,  []),
            cpu: new FormControl(int_cpu,  []),
            addCPU: new FormControl(int_addcpu,  []),
            ram: new FormControl(int_ram,  []),
            addRAM: new FormControl(int_addram,  []),
            storage: new FormControl(int_sto,  []),
            addStorage: new FormControl(int_addsto,  []),
            backupstorage: new FormControl(int_bsto,  []),
            addBackupstorage: new FormControl(int_addbsto,  []),
          });
          (<FormArray>this.NewCalcForm.get('servers')).push(control);
          //console.log(this.NewCalcForm.get('servers'))
        }
      break;
    }

    //Baue DB Server DEV QS
    for (var i = 1; i <= amountDBServerDEV+amountDBServerQS; i++){
      string_stage = ""
      if (i == 1 && amountDBServerDEV == 1){ 
      string_stage = "DEV"
      }
      else if (i == 2 && amountDBServerQS == 1){
      string_stage = "QS"
      }
      string_size = "XL"
      string_role = "DB"
      int_cpu = 8
      int_ram = 32
      int_sto = 0
      int_bsto = 0
      int_addcpu = 0
      int_addram = 0
      int_addsto = 50
      int_addbsto = 100

      const control = new FormGroup({
        id: new FormControl(null, []),
        role: new FormControl(string_role, []),
        stage: new FormControl(string_stage,  []),
        size: new FormControl(string_size,  []),
        cpu: new FormControl(int_cpu,  []),
        addCPU: new FormControl(int_addcpu,  []),
        ram: new FormControl(int_ram,  []),
        addRAM: new FormControl(int_addram,  []),
        storage: new FormControl(int_sto,  []),
        addStorage: new FormControl(int_addsto,  []),
        backupstorage: new FormControl(int_bsto,  []),
        addBackupstorage: new FormControl(int_addbsto,  []),
      });
      (<FormArray>this.NewCalcForm.get('servers')).push(control);
      //console.log(this.NewCalcForm.get('servers'))
    }

    //Baue  Server DEV QS
    for (var i = 1; i <= amountJobServerDEV+amountJobServerQS; i++){
      string_stage = ""
      if (i == 1 && amountJobServerDEV == 1){ 
        string_stage = "DEV"
      }
      else if (i == 2 && amountJobServerQS == 1){
        string_stage = "QS"
      }
      string_size = "XL"
      string_role = "Job"
      int_cpu = 8
      int_ram = 32
      int_sto = 0
      int_bsto = 0
      int_addcpu = 0
      int_addram = 0
      int_addsto = 50
      int_addbsto = 100

      const control = new FormGroup({
        id: new FormControl(null, []),
        role: new FormControl(string_role, []),
        stage: new FormControl(string_stage,  []),
        size: new FormControl(string_size,  []),
        cpu: new FormControl(int_cpu,  []),
        addCPU: new FormControl(int_addcpu,  []),
        ram: new FormControl(int_ram,  []),
        addRAM: new FormControl(int_addram,  []),
        storage: new FormControl(int_sto,  []),
        addStorage: new FormControl(int_addsto,  []),
        backupstorage: new FormControl(int_bsto,  []),
        addBackupstorage: new FormControl(int_addbsto,  []),
      });
      (<FormArray>this.NewCalcForm.get('servers')).push(control);
      //console.log(this.NewCalcForm.get('servers'))
    }

    //Baue DC Server DEV QS
    for (var i = 1; i <= amountDCDEV+amountDCQS; i++){
      string_stage = ""
      if (i == 1 && amountDCDEV == 1){ 
        string_stage = "DEV"
      }
      else if (i == 2 && amountDCQS == 1){
        string_stage = "QS"
      }
      string_size = "XL"
      string_role = "DC"
      int_cpu = 8
      int_ram = 32
      int_sto = 0
      int_bsto = 0
      int_addcpu = 0
      int_addram = 0
      int_addsto = 50
      int_addbsto = 100

      const control = new FormGroup({
        id: new FormControl(null, []),
        role: new FormControl(string_role, []),
        stage: new FormControl(string_stage,  []),
        size: new FormControl(string_size,  []),
        cpu: new FormControl(int_cpu,  []),
        addCPU: new FormControl(int_addcpu,  []),
        ram: new FormControl(int_ram,  []),
        addRAM: new FormControl(int_addram,  []),
        storage: new FormControl(int_sto,  []),
        addStorage: new FormControl(int_addsto,  []),
        backupstorage: new FormControl(int_bsto,  []),
        addBackupstorage: new FormControl(int_addbsto,  []),
      });
      (<FormArray>this.NewCalcForm.get('servers')).push(control);
      //console.log(this.NewCalcForm.get('servers'))
    }
  
    //Formgroup erzeugen
    var string_stage:string = ""
    var string_role:string = ""
    var string_size:string = ""
    var int_cpu:number = 0
    var int_ram:number = 0
    var int_sto:number = 0
    var int_bsto:number = 0
    var int_addcpu:number = 0
    var int_addram:number = 0
    var int_addsto:number = 0
    var int_addbsto:number = 0
    
    
  }
  

  // Variables and Arrays
  // Form Variables

  NewCalcForm : FormGroup = new FormGroup({
    id: new FormControl(),
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

  optionValueOIM = 1;
  optionValueSLA = 1;
  optionValueStages = 2;
  optionValuededicatedSrv = false;
  optionValuededicatedSQLSrv = false;
  optionValueantivirSrv = false;
  optionValueMSAD = 0;
  optionValueMSAAD = 0;
  optionValueMSEX = 0;
  optionValueMSEXO = 0;
  optionValueMSSP = 0;
  optionValueMSSPO = 0;
  optionValueMSTEAMS = 0;
  optionValueFS = 0;
  optionValueSAPHCMCSV = false;
  optionValueSAPHCM = false;
  optionValueSAPAPP = 0;
  optionValueLDAP = 0;
  optionValueSTAR = 0;
  optionValueCloudProduct = "Keine Starling Cloud Anbindung vorgesehen.";
  disabledLicense = false;
}
