import { Pricing } from './pricing';

export interface Server {
    role: string;
    stage: string;
    size: string;
    cpu: number;
    ram: number;
    storage: number;
    backupstorage: number;
}

export interface Calculation {
    _id: string;
    basicform: {
        calculationName: string;
        calculationDesc: string;
    };
    customerform: {
        customerName: string;
        customerEmployees: number;
    };
    targetsystemsform: {
        licenseOIM: number;
        servicelevel: number;
        stages: number;
        sizingMode: string;
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
        mssqlRedundancy?: boolean;
        webRedundancy?: boolean;
    };
    servers: Server[];
    consultingform?: {
        includedPtPerMonth: number;
    };
    pricingSnapshot?: Pricing;
}
