import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Calculation } from '../interfaces/calculation';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(    private http: HttpClient    ) { }

    // URL to web api
    private APIUrl = 'api/';
    private CalcUrl = this.APIUrl + 'Calculations'
    private ServerUrl = this.APIUrl + 'Servers'

    // http header options
    httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    ////////////// GET METHODS //////////////


    /** GET every calculation in database for navigation bar */
    getCalculations(): Observable<Calculation[]> {
      return this.http.get<Calculation[]>(this.CalcUrl).pipe(
        catchError(this.handleError<Calculation[]>('getCalculations', []))
      );
    }

    /** GET calculation by id. Will 404 if id not found */
    getCalculationByCalcID(id: number): Observable<Calculation> {
      const url = `${this.CalcUrl}/${id}`;
      return this.http.get<Calculation>(url).pipe(
        catchError(this.handleError<Calculation>(`getCalculationByCalcID calculationid=${id}`))
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

    ////////////// DELETE METHODS //////////////

    /** DELETE: delete the calculation from database */
    deleteCalculation(id: number): Observable<Calculation> {
      const url = `${this.CalcUrl}/${id}`;

      return this.http.delete<Calculation>(url, this.httpOptions).pipe(
        catchError(this.handleError<Calculation>('deleteHero'))
      );
    }

    ////////////// SAVE METHODS //////////////

    /**  ADD: add the calculation to database
    addCalculation(calculation: Calculation): Observable<Calculation> {
      return this.http.post<Calculation>(this.CalcUrl, calculation, this.httpOptions).pipe(
        tap((data: Calculation) => console.log('createProduct: ' + JSON.stringify(data))),
        catchError(this.handleError<any>('addCalculation'))
        )
    }*/

    /** ADD: add the calculation to database */
    addCalculation(calculation: Calculation) {
      // Send Http request
      this.http.post(this.CalcUrl, calculation).subscribe(
        responseData => {
                          console.log(responseData);
                        });
    }


    /** PUT: update the calculation in database
    updateCalculation(calculation: Calculation): Observable<any> {
      return this.http.put(this.CalcUrl, calculation, this.httpOptions).pipe(
        catchError(this.handleError<any>('updateCalculation'))
      );
    }*/

    /** PUT: update the calculation in database */
    updateCalculation(data: string, id: number) {
      // Send Http request
      this.http.put(this.CalcUrl + "/" + id, JSON.parse(data), this.httpOptions).subscribe(
        responseData => {
                          console.log(JSON.parse(data));
                        });
    }

    // error handling function

    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {
  
        // log to console instead
        console.error(error); 
  
        // Let the app keep running by returning an empty result.
        return of(result as T);
      };
    }
}

