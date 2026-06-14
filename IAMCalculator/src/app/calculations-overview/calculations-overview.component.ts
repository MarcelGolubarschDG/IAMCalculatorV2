import { Component, OnInit } from '@angular/core';
import { Calculation } from '../interfaces/calculation';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Pricing, DEFAULT_PRICING, CALC_ROLE_MAP } from '../interfaces/pricing';

@Component({
    selector: 'app-calculations-overview',
    templateUrl: './calculations-overview.component.html',
    styleUrl: './calculations-overview.component.css',
    standalone: false
})
export class CalculationsOverviewComponent implements OnInit {

  calculations: Calculation[] = [];
  pricing: Pricing = {
    serverRoles: Object.fromEntries(Object.entries(DEFAULT_PRICING.serverRoles).map(([k, v]) => [k, { ...v }])),
    roleDefs: DEFAULT_PRICING.roleDefs.map(r => ({ ...r })),
    sizingDefs: DEFAULT_PRICING.sizingDefs.map(s => ({ ...s })),
    containerSizingDefs: DEFAULT_PRICING.containerSizingDefs.map(c => ({ ...c })),
    dockerCluster: { ...DEFAULT_PRICING.dockerCluster },
    consulting: { ...DEFAULT_PRICING.consulting },
    currency: 'EUR'
  };

  
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
    ) { 
      route.params.subscribe(val => {

      this.getCalculations();
      this.apiService.getPricing().subscribe(p => {
        if (p && p.serverRoles) {
          this.pricing = {
            serverRoles: Object.fromEntries(Object.entries(DEFAULT_PRICING.serverRoles).map(([k, v]) => [k, { ...v, ...(p.serverRoles[k] || {}) }])),
            roleDefs: (p.roleDefs?.length > 0) ? p.roleDefs.map((r: any) => ({ ...r })) : DEFAULT_PRICING.roleDefs.map(r => ({ ...r })),
            sizingDefs: (p.sizingDefs?.length > 0) ? p.sizingDefs.map((s: any) => ({ ...s })) : DEFAULT_PRICING.sizingDefs.map(s => ({ ...s })),
            containerSizingDefs: (p.containerSizingDefs?.length > 0) ? p.containerSizingDefs.map((c: any) => ({ ...c })) : DEFAULT_PRICING.containerSizingDefs.map(c => ({ ...c })),
            dockerCluster: p.dockerCluster ? { ...p.dockerCluster } : { ...DEFAULT_PRICING.dockerCluster },
            consulting: { ...DEFAULT_PRICING.consulting, ...(p.consulting || {}) },
            currency: p.currency || 'EUR'
          };
        }
      });

    }); }

    ngOnInit(): void {
    }

  // nagivate fuction
  goToPage(value:any) {
    this.router.navigateByUrl(value)
  }

  // nagivate fuction
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

  // calculate amout of Targetsystems for overview cards
  amountOfTargetsystems (id:string) {
    let counter = 0;
    let amount = 0;
    for (let i = 0; i < this.calculations.length; i++) {
      if (this.calculations[i]._id === id)
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

  costForCalc(calc: Calculation): string {
    if (!calc.servers || calc.servers.length === 0) return 'auf Anfrage';
    const total = calc.servers.reduce((sum, srv) => {
      const roleKey = CALC_ROLE_MAP[srv.role] || 'jobservice';
      return sum + (this.pricing.serverRoles[roleKey]?.[srv.size] || 0);
    }, 0);
    if (total === 0) return 'auf Anfrage';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    }).format(total) + ' / Monat';
  }

  // calculate amout of servers for overview cards
  amountOfServerByCalcID(id:string) {
    let counter = 0;
    for (let i = 0; i < this.calculations.length; i++) {
      if (this.calculations[i]._id === id) {
        counter = this.calculations[i].servers.length
      };
    }
    return counter
  }
}