import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Calculation } from '../interfaces/calculation';
import { Pricing, DEFAULT_PRICING } from '../interfaces/pricing';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  private APIUrl = '/api/';
  private CalcUrl = this.APIUrl + 'calculation';
  private CalcUrlID = this.CalcUrl + '/id';
  private PricingUrl = this.APIUrl + 'pricing';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  getCalculations(): Observable<Calculation[]> {
    return this.http.get<Calculation[]>(this.CalcUrl).pipe(
      catchError(this.handleError<Calculation[]>('getCalculations', []))
    );
  }

  getCalculationByCalcID(id: string): Observable<Calculation> {
    return this.http.get<Calculation>(`${this.CalcUrlID}/${id}`).pipe(
      catchError(this.handleError<Calculation>(`getCalculationByCalcID id=${id}`))
    );
  }

  searchCalcs(term: string): Observable<Calculation[]> {
    if (!term.trim()) return of([]);
    return this.http.get<Calculation[]>(`${this.CalcUrl}/?calculationname=${term}`).pipe(
      catchError(this.handleError<Calculation[]>('searchCalcs', []))
    );
  }

  deleteCalculation(id: string): Observable<any> {
    return this.http.delete(`${this.CalcUrlID}/${id}`, this.httpOptions).pipe(
      catchError(error => throwError(() => error))
    );
  }

  addCalculation(calculation: Omit<Calculation, '_id'>): Observable<any> {
    return this.http.post(this.CalcUrl, calculation, this.httpOptions).pipe(
      catchError(this.handleError('addCalculation'))
    );
  }

  updateCalculation(data: object, id: string): Observable<any> {
    return this.http.put(`${this.CalcUrl}/id/${id}`, data, this.httpOptions).pipe(
      catchError(this.handleError('updateCalculation'))
    );
  }

  getPricing(): Observable<Pricing> {
    return this.http.get<Pricing>(this.PricingUrl).pipe(
      catchError(this.handleError<Pricing>('getPricing', { ...DEFAULT_PRICING }))
    );
  }

  updatePricing(pricing: Pricing): Observable<Pricing> {
    return this.http.put<Pricing>(this.PricingUrl, pricing, this.httpOptions).pipe(
      catchError(this.handleError<Pricing>('updatePricing'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
