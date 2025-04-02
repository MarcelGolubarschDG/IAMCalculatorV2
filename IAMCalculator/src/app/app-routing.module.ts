import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculationDetailComponent } from './calculation-detail/calculation-detail.component';
import { EditCalculationDetailComponent } from './edit-calculation-detail/edit-calculation-detail.component';
import { HomeComponent } from './home/home.component';
import { NewCalculationDetailComponent } from './new-calculation-detail/new-calculation-detail.component';
import { CalculationsOverviewComponent } from './calculations-overview/calculations-overview.component';

const routes: Routes = [

{
    path: 'Home', component: HomeComponent,
},
{
    path: 'OverviewManagedIAM', component: CalculationsOverviewComponent, pathMatch: 'full',
},
{
    path: 'OverviewIAMonDemand', component: CalculationsOverviewComponent, pathMatch: 'full',
},
{
    path: 'Calculation/:id', component: CalculationDetailComponent, pathMatch: 'full',
},
{
    path: 'Edit/Calculation/:id', component: EditCalculationDetailComponent, pathMatch: 'full',
},
{
    path: 'NewCalculationManagedIAM', component: NewCalculationDetailComponent,
},
{
    path: 'NewCalculationIAMonDemand', component: NewCalculationDetailComponent,
},
{
    path: '', pathMatch: 'full', redirectTo: 'Home',
}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
