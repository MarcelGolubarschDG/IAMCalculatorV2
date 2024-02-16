import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Calculation } from './interfaces/calculation';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const Calculations = [
      { 
        id: 0, 
        basicform:{calculationName: 'Kalkulation 1', calculationDesc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem a'},
        customerform:{customerName: 'BYI', customerNumber: 123, customerInternalEmployees: 1000, customerExternalEmployees: 200},
        marketunitform:{marketunitName: 'DG OPS', marketunitResponsible: 'Hans Wurst'},
        targetsystemsform:{licenseOIM: 1, servicelevel: 1, stages: 1, antivirSrv: true, dedicatedSrv: true, dedicateSQLSrv: true, SAPHCMCSV: true, SAPHCM: false, amountMSAD: 1, amountMSAAD: 0, amountMSEX: 1, amountMSEXO: 0, amountMSSP: 0, amountMSSPO: 0, amountMSTEAMS: 0, amountFS: 0, amountSAPAPP: 0, amountLDAP: 0, amountSTAR: 1, cloudProducts: 'ServiceNow'},
        servers: [
          { role: 'Database Server', stage: 'Prod', size: 'XL', cpu: 4, addCPU: 1, ram: 8, addRAM: 8, storage: 100, addStorage: 50, backupstorage:200, addBackupstorage: 50 },
          { role: 'Web Server', stage: 'Prod', size: 'L', cpu: 4, addCPU: 0, ram: 8, addRAM: 0, storage: 100, addStorage: 0, backupstorage:200, addBackupstorage: 0 },
          { role: 'App Server', stage: 'Prod', size: 'L', cpu: 4, addCPU: 0, ram: 8, addRAM: 0, storage: 100, addStorage: 0, backupstorage:200, addBackupstorage: 0 }
        ]
      },
      { 
        id: 1, 
        basicform:{calculationName: 'Kalkulation 2', calculationDesc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem a'},
        customerform:{customerName: 'BYI', customerNumber: 123, customerInternalEmployees: 1000, customerExternalEmployees: 200},
        marketunitform:{marketunitName: 'DG OPS', marketunitResponsible: 'Hans Wurst'},
        targetsystemsform:{licenseOIM: 2, servicelevel: 2, stages: 2, antivirSrv: true, dedicatedSrv: true, dedicatedSQLSrv: true, SAPHCMCSV: false, SAPHCM: true, amountMSAD: 1, amountMSAAD: 0, amountMSEX: 1, amountMSEXO: 0, amountMSSP: 0, amountMSSPO: 0, amountMSTEAMS: 0, amountFS: 0, amountSAPAPP: 0, amountLDAP: 0, amountSTAR: 1, cloudProducts: 'ServiceNow'},
        servers: [
          { role: 'Database Server', stage: 'Prod', size: 'XL', cpu: 4, addCPU: 1, ram: 8, addRAM: 8, storage: 100, addStorage: 50, backupstorage:200, addBackupstorage: 50 },
          { role: 'Web Server', stage: 'Prod', size: 'L', cpu: 4, addCPU: 0, ram: 8, addRAM: 0, storage: 100, addStorage: 0, backupstorage:200, addBackupstorage: 0 },
          { role: 'App Server', stage: 'Prod', size: 'L', cpu: 4, addCPU: 0, ram: 8, addRAM: 0, storage: 100, addStorage: 0, backupstorage:200, addBackupstorage: 0 },
          { role: 'App Server', stage: 'Prod', size: 'L', cpu: 4, addCPU: 0, ram: 8, addRAM: 0, storage: 100, addStorage: 0, backupstorage:200, addBackupstorage: 0 }
        ]
      },

    ];

    return {Calculations};
  }

// Overrides the genId method to ensure that a hero always has an id.
  // If the heroes array is empty,
  // the method below returns the initial number (11).
  // if the heroes array is not empty, the method below returns the highest
  // hero id + 1.
  genId(Calculations: Calculation[]): number {
    return Calculations.length > 0 ? Math.max(...Calculations.map(Calculation => Calculation.id)) + 1 : 11;
  }
}
