import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { Calculation } from '../interfaces/calculation';

interface BasicForm {
  calculationName: string;
  calculationDesc: string;
}

interface CustomerForm {
  customerName: string;
  customerNumber: number;
  customerEmployees: number;
}

interface MarketUnitForm {
  marketunitName: string;
  marketunitResponsible: string;
}

interface TargetSystemsForm {
  licenseOIM: number;
  servicelevel: number;
  stages: number;
  antivirSrv: boolean;
  dedicatedSrv: boolean;
  dedicatedSQLSrv: boolean;
  SAPHCMCSV: boolean;
  SAPHCM: boolean;
  amountMSAD: number;
  amountMSAAD: number;
  amountMSEX: number;
  amountMSEXO: number;
  amountMSSP: number;
  amountMSSPO: number;
  amountMSTEAMS: number;
  amountFS: number;
  amountSAPAPP: number;
  amountLDAP: number;
  amountSTAR: number;
  cloudProducts: string;
}

interface ServerData {
  role: string;
  stage: string;
  size: string;
  cpu: number;
  addCPU: number;
  ram: number;
  addRAM: number;
  storage: number;
  addStorage: number;
  backupstorage: number;
  addBackupstorage: number;
}

@Injectable({
  providedIn: 'root'
})
export class CsvExportServiceService {

  constructor(private http: HttpClient) {}
  private APIUrl = 'http://localhost:5067/api/Calculations/'

  exportCsv(id: number) {
    this.http.get<any[]>(this.APIUrl+id).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return [];
      })
    ).subscribe(data => {
      const csvData = this.convertToCsv(data);
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'data.csv');
      } else {
        console.error('Error converting data to CSV');
      }
    });
  }

  private convertToCsv(data: any): string {
    let csv = '';

    // Headerzeilen für jede FormGroup
    Object.keys(data).forEach(key => {
      const group = data[key];
      if (typeof group === 'object') {
        const keys = Object.keys(group);
        const values = Object.values(group).map(val => {
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val}"`;
          }
          return val;
        });
        csv += `${key},${keys.join(',')}\n${key},${values.join(',')}\n`;
      }
    });

    // Headerzeile für Serverdaten
    const serverKeys = Object.keys(data.servers[0]);
    csv += `servers,${serverKeys.join(',')}\n`;

    // Datenzeilen für Serverdaten
    data.servers.forEach((server: ServerData) => {
      csv += 'servers,' + Object.values(server).join(',') + '\n';
    });

    return csv;
  }


  private convertObjectToCsv(obj: any): string {
    const values = Object.values(obj);
    return values.map(val => {
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`; // Werte mit Komma in Anführungszeichen setzen
      }
      return val;
    }).join(',');
  }
}