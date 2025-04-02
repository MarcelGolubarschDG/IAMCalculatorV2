import { Component, OnInit } from '@angular/core';
import { Calculation } from '../interfaces/calculation';
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

  amountOfTargetsystems (id:string) {
    let counter = 0;
    let amount = 0;
    for (let i = 0; i < this.calculations.length; i++) {
      if (this.calculations[i]._id.oid === id)
      {
        amount = Number(this.calculations[i].targetsystemsform.amountMSAD)
               + Number(this.calculations[i].targetsystemsform.amountMSAAD)
               + Number(this.calculations[i].targetsystemsform.amountMSEX)
               + Number(this.calculations[i].targetsystemsform.amountMSEXO)
               + Number(this.calculations[i].targetsystemsform.amountMSSP)
               + Number(this.calculations[i].targetsystemsform.amountMSSPO)
               + Number(this.calculations[i].targetsystemsform.amountMSTEAMS)
               + Number(this.calculations[i].targetsystemsform.amountFS)
               + Number(this.calculations[i].targetsystemsform.amountSAPAPP)
               + Number(this.calculations[i].targetsystemsform.amountLDAP)
               + Number(this.calculations[i].targetsystemsform.amountSTAR)
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
  amountOfServerByCalcID(id:string) {
    let counter = 0;
    for (let i = 0; i < this.calculations.length; i++) {
      if (this.calculations[i]._id.oid === id) {
        counter = this.calculations[i].servers.length
      };
    }
    return counter
  }

  

}
