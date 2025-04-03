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
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CalculationsOverviewComponent } from './calculations-overview/calculations-overview.component';
import { OAuthModule } from 'angular-oauth2-oidc';


@NgModule({
  declarations: [
        AppComponent,
        NavbarComponent,
        NewCalculationDetailComponent,
        HomeComponent,
        CalculationDetailComponent,
        EditCalculationDetailComponent,
        CalculationsOverviewComponent
    ],
    bootstrap: [
      AppComponent
    ], imports: [
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      AppRoutingModule,
      OAuthModule.forRoot({
        resourceServer: {
          sendAccessToken: true,
          allowedUrls: ['http://www.angular.at/api/'] 
        }
      }),
      BrowserAnimationsModule,
      ToastrModule.forRoot({
          timeOut: 10000,
          positionClass: 'toast-bottom-center',
          preventDuplicates: true,
      }),
      MatStepperModule,
      MatButtonModule,
      MatRadioModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatIconModule,
      MatSelectModule,
      MatInputModule,
      MatFormFieldModule,
      MatCheckboxModule,
      MatGridListModule,
      MatTooltipModule
    ], providers: [
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
export class AppModule { }
