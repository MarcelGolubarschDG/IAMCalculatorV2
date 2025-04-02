import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

interface ServerData {
  [key: string]: any; // Indexsignatur für beliebige Schlüssel vom Typ string
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
export class ExcelExportServiceService {

  constructor(private http: HttpClient) {}

  private APIUrl = 'http://localhost:3000/api/Calculation/id/'


  exportXlsx(id: string) {
    const wb = XLSX.utils.book_new();
    this.http.get<any[]>(this.APIUrl+id).subscribe(data => {
      // Füge Daten als neues Arbeitsblatt hinzu
    const wsData = this.convertToXlsx(data);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Exportiere Arbeitsmappe als XLSX-Datei
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'data.xlsx');
    })
  }

  private convertToXlsx(data: any): any[][] {
    const wsData: any[][] = [];

    // Füge Daten für jede FormGroup hinzu
    Object.keys(data).forEach(key => {
      const group = data[key];
      if (typeof group === 'object') {
        const keys = Object.keys(group);
        const headerRow = [key, ...keys];
        wsData.push(headerRow);

        const valueRow = [key, ...Object.values(group)];
        wsData.push(valueRow);

        // Füge leere Zeile hinzu
        wsData.push([]);
      }
    });

    // Füge Daten für Serverdaten hinzu
    if (data.servers && data.servers.length > 0) {
      const serverKeys = Object.keys(data.servers[0]);
      const serverHeaderRow = ['servers', ...serverKeys];
      wsData.push(serverHeaderRow);

      data.servers.forEach((server: ServerData) => {
        const serverValues = [Object.values(server)];
        wsData.push(['servers', ...serverValues]);
      });

      // Füge leere Zeile hinzu
      wsData.push([]);
    }

    return wsData;
  }

}
