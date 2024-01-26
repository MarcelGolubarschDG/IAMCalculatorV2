import { Component, OnInit } from '@angular/core';
import { Calculation } from '../interfaces/calculation';
import { Server } from '../interfaces/server';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-calculations-overview',
  templateUrl: './calculations-overview.component.html',
  styleUrl: './calculations-overview.component.css'
})
export class CalculationsOverviewComponent implements OnInit {

  // init empty array with interface (defined in interfaces) 
  calculations: Calculation[] = [];
  servers: Server[] = [];

  
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
    ) { 
      route.params.subscribe(val => {
      // put the code from `ngOnInit` here
      this.getCalculations();
      //this.getServers();
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

  // load all calculations via ApiService
  getCalculations() {
    this.apiService.getCalculations().subscribe({
      next: res => {
        this.calculations = res as Calculation[]
      },
      error: err => { console.log(err) } 
    })
  }

  amountOfTargetsystems (id:number) {
    let counter = 0;
    let amount = 0;
    for (let i = 0; i < this.calculations.length; i++) {
      if (this.calculations[i].id === id)
      {
        amount = Number(this.calculations[i].targetsystems.amountMSAD)
               + Number(this.calculations[i].targetsystems.amountMSAAD)
               + Number(this.calculations[i].targetsystems.amountMSEX)
               + Number(this.calculations[i].targetsystems.amountMSEXO)
               + Number(this.calculations[i].targetsystems.amountMSSP)
               + Number(this.calculations[i].targetsystems.amountMSSPO)
               + Number(this.calculations[i].targetsystems.amountMSTEAMS)
               + Number(this.calculations[i].targetsystems.amountFS)
               + Number(this.calculations[i].targetsystems.amountSAPHCMCSV)
               + Number(this.calculations[i].targetsystems.amountSAPHCM)
               + Number(this.calculations[i].targetsystems.amountSAPAPP)
               + Number(this.calculations[i].targetsystems.amountLDAP)
               + Number(this.calculations[i].targetsystems.amountSTAR)
      }
      
    }
    return amount
  }
  /** load all servers via ApiService
  getServers(): void {
    this.apiService.getServers()
    .subscribe(servers => this.servers = servers);
  }*/

  // get all servers from array server for specific calcid ### source https://www.freecodecamp.org/news/how-to-count-objects-in-an-array/
  amountOfServerByCalcID(id:number) {
    let counter = 0;
    for (let i = 0; i < this.calculations.length; i++) {
      if (this.calculations[i].id === id) {
        counter = this.calculations[i].servers.length
      };
    }
    return counter
  }


  // delete calculation via API
  delete(calculation: Calculation): void {
    this.calculations = this.calculations.filter(h => h !== calculation);
    this.apiService.deleteCalculation(calculation.id).subscribe();
    this.toastr.error('Deleted successfully', 'Calculation Detail Register')
  }

}
