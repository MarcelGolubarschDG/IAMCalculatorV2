import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NewCalculationDetailComponent } from './new-calculation-detail/new-calculation-detail.component';
import { HomeComponent } from './home/home.component';
import { CalculationDetailComponent } from './calculation-detail/calculation-detail.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditCalculationDetailComponent } from './edit-calculation-detail/edit-calculation-detail.component';
import { CalculationsOverviewComponent } from './calculations-overview/calculations-overview.component';
import { PricingConfigComponent } from './pricing-config/pricing-config.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NewCalculationDetailComponent,
    HomeComponent,
    CalculationDetailComponent,
    EditCalculationDetailComponent,
    CalculationsOverviewComponent,
    PricingConfigComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    }),
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }
