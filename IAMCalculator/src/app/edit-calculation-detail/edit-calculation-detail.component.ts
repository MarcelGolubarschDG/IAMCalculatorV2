import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Calculation } from '../interfaces/calculation';

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
      this.getCalculation()
  }

  getCalculation() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id)
    .subscribe(calculations => this.calculations = calculations);
  }
  
}
