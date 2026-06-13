import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Pricing, DEFAULT_PRICING, CALC_ROLE_MAP, SizingDef } from '../interfaces/pricing';

@Component({
    selector: 'app-new-calculation-detail',
    templateUrl: './new-calculation-detail.component.html',
    styleUrl: './new-calculation-detail.component.css',
    standalone: false
})
export class NewCalculationDetailComponent implements OnInit {

  sapHCMMode: 'none' | 'csv' | 'connector' = 'none';
  disabledLicense = false;
  pricing: Pricing = {
    serverRoles: Object.fromEntries(Object.entries(DEFAULT_PRICING.serverRoles).map(([k, v]) => [k, { ...v }])),
    roleDefs: DEFAULT_PRICING.roleDefs.map(r => ({ ...r })),
    sizingDefs: DEFAULT_PRICING.sizingDefs.map(s => ({ ...s })),
    consulting: { ...DEFAULT_PRICING.consulting },
    currency: 'EUR'
  };

  get serverControls() {
    return (this.NewCalcForm.get('servers') as FormArray).controls;
  }

  constructor(
    public apiservice: ApiService,
    private router: Router,
    private location: Location
  ) {}

  get totalMonthlyCost(): number {
    return this.serverControls.reduce((sum, ctrl) => {
      const roleKey = CALC_ROLE_MAP[ctrl.value.role] || 'jobservice';
      return sum + (this.pricing.serverRoles[roleKey]?.[ctrl.value.size] || 0);
    }, 0);
  }

  fmt(val: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    }).format(val);
  }

  ngOnInit(): void {
    this.apiservice.getPricing().subscribe(p => {
      if (p && p.serverRoles) {
        this.pricing = {
          serverRoles: Object.fromEntries(Object.entries(DEFAULT_PRICING.serverRoles).map(([k, v]) => [k, { ...v, ...(p.serverRoles[k] || {}) }])),
          roleDefs: (p.roleDefs?.length > 0) ? p.roleDefs.map((r: any) => ({ ...r })) : DEFAULT_PRICING.roleDefs.map(r => ({ ...r })),
          sizingDefs: (p.sizingDefs?.length > 0) ? p.sizingDefs.map((s: any) => ({ ...s })) : DEFAULT_PRICING.sizingDefs.map(s => ({ ...s })),
          consulting: { ...DEFAULT_PRICING.consulting, ...(p.consulting || {}) },
          currency: p.currency || 'EUR'
        };
      }
    });
    this.NewCalcForm.valueChanges.subscribe(() => {
      if (this.NewCalcForm.get('customerform.customerEmployees')?.value) {
        this.calcServerSize(this.NewCalcForm.value);
      }
    });
  }

  goBack(): void { this.location.back(); }
  goToPage(value: any) { this.router.navigateByUrl(value); }

  onSubmit() {
    this.onPostForm(this.NewCalcForm.value);
    this.NewCalcForm.reset();
    this.goToPage('/OverviewManagedIAM');
  }

  onPostForm(data: any) {
    const tf = data.targetsystemsform;
    const jsonObject = {
      id: data.id,
      basicform: {
        calculationName: data.basicform?.calculationName ?? '',
        calculationDesc: data.basicform?.calculationDesc ?? ''
      },
      customerform: {
        customerName: data.customerform?.customerName ?? '',
        customerEmployees: parseInt(data.customerform?.customerEmployees) || 0
      },
      targetsystemsform: {
        licenseOIM: parseInt(tf.licenseOIM) || 1,
        servicelevel: parseInt(tf.servicelevel) || 1,
        stages: parseInt(tf.stages) || 2,
        minimalistic: Boolean(tf.minimalistic),
        amountMSAD: parseInt(tf.amountMSAD) || 0,
        amountMSAAD: parseInt(tf.amountMSAAD) || 0,
        amountMSEX: parseInt(tf.amountMSEX) || 0,
        amountMSEXO: parseInt(tf.amountMSEXO) || 0,
        amountMSSP: parseInt(tf.amountMSSP) || 0,
        amountMSSPO: parseInt(tf.amountMSSPO) || 0,
        amountMSTEAMS: parseInt(tf.amountMSTEAMS) || 0,
        amountFS: parseInt(tf.amountFS) || 0,
        SAPHCMCSV: tf.SAPHCMCSV,
        SAPHCM: tf.SAPHCM,
        amountSAPAPP: parseInt(tf.amountSAPAPP) || 0,
        amountLDAP: parseInt(tf.amountLDAP) || 0,
        amountSTAR: parseInt(tf.amountSTAR) || 0
      },
      servers: data.servers,
      consultingform: {
        includedPtPerMonth: parseFloat(data.consultingform?.includedPtPerMonth) || 0
      }
    };
    this.apiservice.addCalculation(jsonObject as any);
  }

  // --- Target system helpers ---

  toggleTarget(field: string) {
    const control = this.NewCalcForm.get(`targetsystemsform.${field}`);
    const newVal = (control?.value || 0) > 0 ? 0 : 1;
    control?.setValue(newVal);
    if (field === 'amountFS') {
      const lic = this.NewCalcForm.get('targetsystemsform.licenseOIM');
      if (newVal > 0) { lic?.setValue(2); this.disabledLicense = true; }
      else { this.disabledLicense = false; }
    }
  }

  isActive(field: string): boolean {
    return (this.NewCalcForm.get(`targetsystemsform.${field}`)?.value || 0) > 0;
  }

  setSAPHCM(mode: 'none' | 'csv' | 'connector') {
    this.sapHCMMode = mode;
    this.NewCalcForm.get('targetsystemsform')?.patchValue({
      SAPHCMCSV: mode === 'csv',
      SAPHCM: mode === 'connector'
    });
  }

  setLicense(value: number) {
    if (this.disabledLicense && value === 1) return;
    this.NewCalcForm.get('targetsystemsform.licenseOIM')?.setValue(value);
    if (this.NewCalcForm.get('customerform.customerEmployees')?.value) {
      this.calcServerSize(this.NewCalcForm.value);
    }
  }

  setStages(value: number) {
    this.NewCalcForm.get('targetsystemsform.stages')?.setValue(value);
  }

  adjustSAPR3(delta: number) {
    const control = this.NewCalcForm.get('targetsystemsform.amountSAPAPP');
    const newVal = Math.max(0, Math.min(9, (control?.value || 0) + delta));
    control?.setValue(newVal);
  }

  // --- Display helpers ---

  getServersByStage(stage: string) {
    return this.serverControls.filter(ctrl => ctrl.value.stage === stage);
  }

  getEmployeeHint(): string {
    const n = parseInt(this.NewCalcForm.get('customerform.customerEmployees')?.value);
    if (!n || isNaN(n)) return '';
    if (n < 2500) return 'Tier S — 1× DB (XL), 1× Web (M)';
    if (n < 5000) return 'Tier M — 1× DB (XL), 1× Web (L)';
    if (n < 8500) return 'Tier L — 1× DB (XL), 2× Web (L)';
    return 'Tier XL — 1× DB (XL), 2× Web (XL)';
  }

  // --- Server calculation ---

  calcServerSize(data: any) {
    const arr = <FormArray>this.NewCalcForm.get('servers');
    while (arr.length !== 0) arr.removeAt(0, { emitEvent: false });

    const tf = data.targetsystemsform;
    const stages = parseInt(tf.stages);
    const servicelevel = parseInt(tf.servicelevel);
    const amountIdentities = parseInt(data.customerform.customerEmployees);
    const minimalistic = Boolean(tf.minimalistic);

    const amountSAPHCM = (tf.SAPHCMCSV || tf.SAPHCM) ? 1 : 0;
    const totalSystems =
      (parseInt(tf.amountMSAD) || 0) + (parseInt(tf.amountMSAAD) || 0) +
      (parseInt(tf.amountMSEX) || 0) + (parseInt(tf.amountMSEXO) || 0) +
      (parseInt(tf.amountMSSP) || 0) + (parseInt(tf.amountMSSPO) || 0) +
      (parseInt(tf.amountMSTEAMS) || 0) + (parseInt(tf.amountFS) || 0) +
      (parseInt(tf.amountSAPAPP) || 0) + (parseInt(tf.amountLDAP) || 0) +
      (parseInt(tf.amountSTAR) || 0) + amountSAPHCM;

    const jobThreshold = this.pricing.consulting.jobServerThreshold || 5;
    const amountJobServerProd = totalSystems > 0 ? Math.ceil(totalSystems / jobThreshold) : 0;
    const amountDBServerProd = servicelevel === 3 ? 2 : 1;

    // T-shirt size picker
    const sizeDefs = this.pricing.sizingDefs;
    const byKey = (key: string): SizingDef => sizeDefs.find(s => s.key === key) ?? sizeDefs[sizeDefs.length - 1];
    const halfOf = (def: SizingDef): SizingDef =>
      sizeDefs.find(s => s.cpu >= def.cpu / 2 && s.ram >= def.ram / 2) ?? sizeDefs[sizeDefs.length - 1];
    const pick = (key: string): SizingDef => { const bp = byKey(key); return minimalistic ? halfOf(bp) : bp; };

    // Best-practice tier sizes for DB and Web
    let webSizeKey: string, webCount: number;
    if (amountIdentities < 2500)      { webSizeKey = 'M'; webCount = 1; }
    else if (amountIdentities < 5000) { webSizeKey = 'L'; webCount = 1; }
    else if (amountIdentities < 8500) { webSizeKey = 'L'; webCount = 2; }
    else                              { webSizeKey = 'XL'; webCount = 2; }

    const dbDef  = pick('XL');
    const webDef = pick(webSizeKey);
    const jobDef = pick('L');
    const envDef = pick('L');

    const addSrv = (role: string, stage: string, def: SizingDef, sto: number, bsto: number) => {
      arr.push(new FormGroup({
        role: new FormControl(role), stage: new FormControl(stage), size: new FormControl(def.key),
        cpu: new FormControl(def.cpu), ram: new FormControl(def.ram),
        storage: new FormControl(sto), backupstorage: new FormControl(bsto)
      }), { emitEvent: false });
    };

    // Prod: DB-Agent + Webserver always, job servers by target system count
    for (let i = 0; i < amountDBServerProd; i++) addSrv('DB',  'Prod', dbDef,  500, 1000);
    for (let i = 0; i < webCount;           i++) addSrv('Web', 'Prod', webDef, 100,  200);
    for (let i = 0; i < amountJobServerProd; i++) addSrv('Job', 'Prod', jobDef, 100, 200);

    // DEV: always 1× L server (stages 2 or 3)
    if (stages >= 2) addSrv('DEV', 'DEV', envDef, 200, 500);
    // QS: always 1× L server (stages 3 only)
    if (stages === 3) addSrv('QS', 'QS', envDef, 200, 500);
  }

  generateID(): number {
    return parseInt(Math.random().toString(10).substring(0, 2));
  }

  NewCalcForm: FormGroup = new FormGroup({
    id: new FormControl(this.generateID()),
    basicform: new FormGroup({
      calculationName: new FormControl(null),
      calculationDesc: new FormControl('')
    }),
    customerform: new FormGroup({
      customerName: new FormControl(null),
      customerNumber: new FormControl(0),
      customerEmployees: new FormControl(null)
    }),
    targetsystemsform: new FormGroup({
      licenseOIM: new FormControl(1),
      servicelevel: new FormControl('1'),
      stages: new FormControl(2),
      minimalistic: new FormControl(false),
      amountMSAD: new FormControl(0),
      amountMSAAD: new FormControl(0),
      amountMSEX: new FormControl(0),
      amountMSEXO: new FormControl(0),
      amountMSSP: new FormControl(0),
      amountMSSPO: new FormControl(0),
      amountMSTEAMS: new FormControl(0),
      amountFS: new FormControl(0),
      amountSAPAPP: new FormControl(0),
      SAPHCMCSV: new FormControl(false),
      SAPHCM: new FormControl(false),
      amountLDAP: new FormControl(0),
      amountSTAR: new FormControl(0)
    }),
    servers: new FormArray([]),
    consultingform: new FormGroup({
      includedPtPerMonth: new FormControl(2)
    })
  });
}
