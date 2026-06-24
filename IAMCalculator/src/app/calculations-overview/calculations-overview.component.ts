import { Component } from '@angular/core';
import { Calculation } from '../interfaces/calculation';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-calculations-overview',
    templateUrl: './calculations-overview.component.html',
    styleUrl: './calculations-overview.component.css',
    standalone: false
})
export class CalculationsOverviewComponent {

  calculations: Calculation[] = [];

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
    ) {
      route.params.subscribe(() => { this.getCalculations(); });
    }

  goToPage(value: string) {
    this.router.navigateByUrl(value);
  }

  getCalculations() {
    this.apiService.getCalculations().subscribe({
      next: res => { this.calculations = res as Calculation[]; },
      error: err => { console.error(err); }
    });
  }

  deleteCalculation(calculation: Calculation, event: Event): void {
    event.stopPropagation();
    const calculationName = calculation.basicform.calculationName || 'diese Kalkulation';
    if (!window.confirm(`Kalkulation "${calculationName}" wirklich löschen?`)) return;

    this.apiService.deleteCalculation(calculation._id).subscribe({
      next: () => {
        this.calculations = this.calculations.filter(c => c._id !== calculation._id);
        this.toastr.success('Kalkulation gelöscht', 'Erfolg');
      },
      error: err => {
        console.error('Error deleting calculation:', err);
        this.toastr.error('Kalkulation konnte nicht gelöscht werden', 'Fehler');
      }
    });
  }

  trackByCalcId(_: number, calc: Calculation): string { return calc._id; }

  amountOfTargetsystems(calc: Calculation): number {
    const tf = calc.targetsystemsform;
    return (Number(tf.amountMSAD) + Number(tf.amountMSAAD) + Number(tf.amountMSEX) +
            Number(tf.amountMSEXO) + Number(tf.amountMSSP) + Number(tf.amountMSSPO) +
            Number(tf.amountMSTEAMS) + Number(tf.amountFS) + Number(tf.amountSAPAPP) +
            Number(tf.amountLDAP) + Number(tf.amountSTAR));
  }
}
