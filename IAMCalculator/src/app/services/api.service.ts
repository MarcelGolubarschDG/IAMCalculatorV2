import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Calculation } from '../interfaces/calculation';
import { Pricing, DEFAULT_PRICING } from '../interfaces/pricing';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(    private http: HttpClient    ) { }

    // URL to web api
    private APIUrl = `http://localhost:3000/api/`;
    private CalcUrl = this.APIUrl + 'calculation';
    private CalcUrlID = this.CalcUrl + '/id';
    private PricingUrl = this.APIUrl + 'pricing';

    // http header options
    httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    

    ////////////// GET METHODS //////////////


    /** GET every calculation in database for navigation bar */
    getCalculations(): Observable<Calculation[]> {
      return this.http.get<Calculation[]>(this.CalcUrl).pipe(
        tap(data => console.log('Erhaltene Daten:', data)), // Log der empfangenen Daten
        catchError(this.handleError<Calculation[]>('getCalculations', []))
      );
    }

    /** GET calculation by id. Will 404 if id not found */
    getCalculationByCalcID(id: string): Observable<Calculation> {
      const url = `${this.CalcUrlID}/${id}`;
      return this.http.get<Calculation>(url).pipe(
        catchError(this.handleError<Calculation>(`getCalculationByCalcID id=${id}`))
      );
    }

    /** GET calculations whose name contains search term */
    searchCalcs(term: string): Observable<Calculation[]> {
      if (!term.trim()) {
        // if not search term, return empty array.
        return of([]);
      }
      return this.http.get<Calculation[]>(`${this.CalcUrl}/?calculationname=${term}`).pipe(
        catchError(this.handleError<Calculation[]>('searchCalcs', []))
      );
    }

    /** DELETE: Lösche die Berechnung aus der Datenbank */
    deleteCalculation(id: string): Observable<any> {
      const url = `${this.CalcUrlID}/${id}`;
      console.log('Delete URL:', url); // Ausgabe der URL für die Anfrage
      return this.http.delete(url, this.httpOptions).pipe(
        tap(response => {
          // Logge die Antwort vom Server
          console.log('API Response for DELETE:', response);
        }),
        catchError(error => {
          // Fehlerbehandlung im Fehlerfall
          console.error('Error during DELETE request:', error);
          return throwError(error); // Wir werfen den Fehler weiter
        })
      );
    }

    /** ADD: add the calculation to database */
    addCalculation(calculation: Calculation) {
      console.log(calculation);
      // Send Http request
      this.http.post(this.CalcUrl, JSON.stringify(calculation), this.httpOptions).subscribe(
        responseData => {
                          console.log(responseData);
                        });
    }


    /** PUT: update the calculation in database */
    updateCalculation(data: string, id: string) {
      // Send Http request
      this.http.put(this.CalcUrl + "/id/" + id, JSON.parse(data), this.httpOptions).subscribe(
        responseData => {
                          console.log(JSON.parse(data));
                        });
    }

    

    /** GET pricing configuration */
    getPricing(): Observable<Pricing> {
      return this.http.get<Pricing>(this.PricingUrl).pipe(
        catchError(this.handleError<Pricing>('getPricing', { ...DEFAULT_PRICING }))
      );
    }

    /** PUT pricing configuration */
    updatePricing(pricing: Pricing): Observable<Pricing> {
      return this.http.put<Pricing>(this.PricingUrl, pricing, this.httpOptions).pipe(
        catchError(this.handleError<Pricing>('updatePricing'))
      );
    }

  /** Fehlerbehandlung für HTTP-Anfragen */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}

