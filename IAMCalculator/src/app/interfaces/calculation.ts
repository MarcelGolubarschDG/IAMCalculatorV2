interface server {
    role:string
    stage:string
    size:string
    cpu:number
    addCPU:number
    ram:number
    addRAM:number
    storage:number
    addStorage:number
    backupstorage:number
    addBackupstorage:number
}
export interface Calculation {
    _id: { oid: string };
    basicform:{
        calculationName:string;
        calculationDesc:string;
    },
    customerform: {
        customerName:string;
        customerNumber:number;
        customerEmployees:number;
    },
    marketunitform:{
        marketunitName:string;
        marketunitResponsible:string;
    },
    targetsystemsform: {
        licenseOIM:number;
        servicelevel:number;
        stages:number;
        antivirSrv:boolean;
        dedicatedSrv:boolean;
        dedicatedStages:boolean;
        SAPHCMCSV:boolean;
        SAPHCM:boolean;
        amountMSAD:number;
        amountMSAAD:number;
        amountMSEX:number;
        amountMSEXO:number;
        amountMSSP:number;
        amountMSSPO:number;
        amountMSTEAMS:number;
        amountFS:number;
        amountSAPAPP:number;
        amountLDAP:number;
        amountSTAR:number;
        cloudProducts:string;
    },
    servers: server[];
}
