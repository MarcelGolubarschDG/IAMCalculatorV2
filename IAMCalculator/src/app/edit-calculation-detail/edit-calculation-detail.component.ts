import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Pricing, DEFAULT_PRICING, SizingDef } from '../interfaces/pricing';
import { SyncChange } from '../new-calculation-detail/new-calculation-detail.component';

@Component({
  selector: 'app-edit-calculation-detail',
  templateUrl: './edit-calculation-detail.component.html',
  styleUrl: './edit-calculation-detail.component.css',
  standalone: false
})
export class EditCalculationDetailComponent implements OnInit {

  sapHCMMode: 'none' | 'csv' | 'connector' = 'none';
  disabledLicense = false;
  calcName = '';
  isLoading = false;
  hasPricingSnapshot = false;

  pricing: Pricing = this.normalizePricing(DEFAULT_PRICING);
  adminPricing: Pricing = this.normalizePricing(DEFAULT_PRICING);

  showSyncConfirm = false;
  showSaveConfirm = false;
  syncChanges: SyncChange[] = [];

  get serverControls() {
    return (this.EditCalcForm.get('servers') as FormArray).controls;
  }

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.apiService.getPricing().subscribe(p => {
      if (p && p.sizingDefs) {
        this.adminPricing = this.normalizePricing(p);
        if (!this.hasPricingSnapshot) {
          this.pricing = this.normalizePricing(p);
        }
      }
    });

    this.EditCalcForm.valueChanges.subscribe(() => {
      if (!this.isLoading && this.EditCalcForm.get('customerform.customerEmployees')?.value) {
        this.calcServerSize(this.EditCalcForm.value);
      }
    });

    this.loadForm();
  }

  loadForm() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.apiService.getCalculationByCalcID(id).subscribe(calc => {
      this.isLoading = true;

      this.calcName = calc.basicform.calculationName;

      // Use saved pricingSnapshot if present; otherwise fall back to admin pricing
      if ((calc as any).pricingSnapshot) {
        this.hasPricingSnapshot = true;
        this.pricing = this.normalizePricing((calc as any).pricingSnapshot);
      }

      const tf = calc.targetsystemsform;
      this.EditCalcForm.patchValue({
        basicform: {
          calculationName: calc.basicform.calculationName,
          calculationDesc: calc.basicform.calculationDesc
        },
        customerform: {
          customerName: calc.customerform.customerName,
          customerEmployees: calc.customerform.customerEmployees
        },
        targetsystemsform: {
          licenseOIM: tf.licenseOIM,
          servicelevel: String(tf.servicelevel),
          stages: tf.stages || 2,
          sizingMode: tf.sizingMode || ((tf as any).minimalistic ? 'vm-minimalistic' : 'vm'),
          amountMSAD: tf.amountMSAD,
          amountMSAAD: tf.amountMSAAD,
          amountMSEX: tf.amountMSEX,
          amountMSEXO: tf.amountMSEXO,
          amountMSSP: tf.amountMSSP,
          amountMSSPO: tf.amountMSSPO,
          amountMSTEAMS: tf.amountMSTEAMS,
          amountFS: tf.amountFS,
          SAPHCMCSV: tf.SAPHCMCSV,
          SAPHCM: tf.SAPHCM,
          amountSAPAPP: tf.amountSAPAPP,
          amountLDAP: tf.amountLDAP,
          amountSTAR: tf.amountSTAR
        }
      });

      this.EditCalcForm.get('consultingform')?.patchValue({
        includedPtPerMonth: calc.consultingform?.includedPtPerMonth ?? 2
      });

      if (tf.SAPHCM) this.sapHCMMode = 'connector';
      else if (tf.SAPHCMCSV) this.sapHCMMode = 'csv';
      else this.sapHCMMode = 'none';

      if (tf.amountFS > 0) this.disabledLicense = true;

      const servers = this.EditCalcForm.get('servers') as FormArray;
      while (servers.length) servers.removeAt(0);
      calc.servers.forEach(srv => {
        servers.push(new FormGroup({
          role: new FormControl(srv.role),
          stage: new FormControl(srv.stage),
          size: new FormControl(srv.size),
          cpu: new FormControl(srv.cpu),
          ram: new FormControl(srv.ram),
          storage: new FormControl(srv.storage),
          backupstorage: new FormControl(srv.backupstorage)
        }));
      });

      this.isLoading = false;
    });
  }

  goBack(): void { this.location.back(); }
  goToPage(value: any) { this.router.navigateByUrl(value); }

  // --- Sync confirm ---

  openSyncConfirm() {
    this.syncChanges = this.computeSyncChanges(this.pricing, this.adminPricing);
    this.showSyncConfirm = true;
  }

  cancelSync() { this.showSyncConfirm = false; }

  confirmSync() {
    this.pricing = this.normalizePricing(this.adminPricing);
    this.hasPricingSnapshot = true;
    if (this.EditCalcForm.get('customerform.customerEmployees')?.value) {
      this.calcServerSize(this.EditCalcForm.value);
    }
    this.showSyncConfirm = false;
  }

  // --- Save confirm ---

  openSaveConfirm() { this.showSaveConfirm = true; }

  cancelSave() { this.showSaveConfirm = false; }

  confirmSave() {
    this.showSaveConfirm = false;
    const id = String(this.route.snapshot.paramMap.get('id'));
    const data = this.EditCalcForm.value;
    const tf = data.targetsystemsform;
    const jsonObject = JSON.stringify({
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
        sizingMode: tf.sizingMode || 'vm',
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
      },
      pricingSnapshot: this.normalizePricing(this.pricing)
    });
    this.apiService.updateCalculation(jsonObject, id);
    this.router.navigateByUrl('/OverviewManagedIAM');
  }

  // --- Target system helpers ---

  toggleTarget(field: string) {
    const control = this.EditCalcForm.get(`targetsystemsform.${field}`);
    const newVal = (control?.value || 0) > 0 ? 0 : 1;
    control?.setValue(newVal);
    if (field === 'amountFS') {
      const lic = this.EditCalcForm.get('targetsystemsform.licenseOIM');
      if (newVal > 0) { lic?.setValue(2); this.disabledLicense = true; }
      else { this.disabledLicense = false; }
    }
  }

  isActive(field: string): boolean {
    return (this.EditCalcForm.get(`targetsystemsform.${field}`)?.value || 0) > 0;
  }

  setSAPHCM(mode: 'none' | 'csv' | 'connector') {
    this.sapHCMMode = mode;
    this.EditCalcForm.get('targetsystemsform')?.patchValue({
      SAPHCMCSV: mode === 'csv',
      SAPHCM: mode === 'connector'
    });
  }

  toggleSAPHCM(mode: 'csv' | 'connector') {
    this.setSAPHCM(this.sapHCMMode === mode ? 'none' : mode);
  }

  setLicense(value: number) {
    if (this.disabledLicense && value === 1) return;
    this.EditCalcForm.get('targetsystemsform.licenseOIM')?.setValue(value);
    if (this.EditCalcForm.get('customerform.customerEmployees')?.value) {
      this.calcServerSize(this.EditCalcForm.value);
    }
  }

  setStages(value: number) {
    this.EditCalcForm.get('targetsystemsform.stages')?.setValue(value);
  }

  adjustSAPR3(delta: number) {
    const control = this.EditCalcForm.get('targetsystemsform.amountSAPAPP');
    const newVal = Math.max(0, Math.min(9, (control?.value || 0) + delta));
    control?.setValue(newVal);
  }

  // --- Display helpers ---

  getServersByStage(stage: string) {
    return this.serverControls.filter(ctrl => ctrl.value.stage === stage);
  }

  getEmployeeHint(): string {
    const n = parseInt(this.EditCalcForm.get('customerform.customerEmployees')?.value);
    if (!n || isNaN(n)) return '';
    const mode = this.EditCalcForm.get('targetsystemsform.sizingMode')?.value || 'vm';
    if (mode === 'container') {
      if (n < 2500) return 'Docker Cluster — Prod (S) + QS/DEV (S)';
      if (n < 5000) return 'Docker Cluster — Prod (M) + QS/DEV (M)';
      if (n < 8500) return 'Docker Cluster — Prod (L) + QS/DEV (L)';
      return 'Docker Cluster — Prod (XL) + QS/DEV (XL)';
    }
    if (mode === 'container-minimalistic') {
      if (n < 2500) return 'Docker Cluster — 1× Cluster (S), alle Stages';
      if (n < 5000) return 'Docker Cluster — 1× Cluster (M), alle Stages';
      if (n < 8500) return 'Docker Cluster — 1× Cluster (L), alle Stages';
      return 'Docker Cluster — 1× Cluster (XL), alle Stages';
    }
    if (n < 2500) return 'Tier S — 1× DB (XL), 1× Web (M)';
    if (n < 5000) return 'Tier M — 1× DB (XL), 1× Web (L)';
    if (n < 8500) return 'Tier L — 1× DB (XL), 2× Web (L)';
    return 'Tier XL — 1× DB (XL), 2× Web (XL)';
  }

  get ptStages(): number { return parseInt(this.EditCalcForm.get('targetsystemsform.stages')?.value) || 2; }
  get ptIdentitiesK(): number { return Math.round((parseInt(this.EditCalcForm.get('customerform.customerEmployees')?.value) || 0) / 100) / 10; }
  get isContainerMode(): boolean { const m = this.EditCalcForm.get('targetsystemsform.sizingMode')?.value || 'vm'; return m === 'container' || m === 'container-minimalistic'; }
  get ptForStages(): number { return Math.round(this.pricing.consulting.ptPerStage * this.ptStages * 10) / 10; }
  get ptForServers(): number { return this.isContainerMode ? 2 : Math.round(this.pricing.consulting.ptPerServerPerMonth * this.serverControls.length * 10) / 10; }
  get ptForIdentities(): number { return Math.round(this.pricing.consulting.ptPer1000IdentitiesPerMonth * this.ptIdentitiesK * 10) / 10; }
  get ptIncluded(): number { return parseFloat(this.EditCalcForm.get('consultingform.includedPtPerMonth')?.value) || 0; }
  get totalMonthlyPT(): number { return Math.round((this.ptForStages + this.ptForServers + this.ptForIdentities) * 10) / 10; }

  // --- Server calculation ---

  calcServerSize(data: any) {
    const arr = <FormArray>this.EditCalcForm.get('servers');
    while (arr.length !== 0) arr.removeAt(0, { emitEvent: false });

    const tf = data.targetsystemsform;
    const stages = parseInt(tf.stages);
    const servicelevel = parseInt(tf.servicelevel);
    const amountIdentities = parseInt(data.customerform.customerEmployees);
    const sizingMode: string = tf.sizingMode || 'vm';

    const amountSAPHCM = (tf.SAPHCMCSV || tf.SAPHCM) ? 1 : 0;
    const totalSystems =
      (parseInt(tf.amountMSAD) || 0) + (parseInt(tf.amountMSAAD) || 0) +
      (parseInt(tf.amountMSEX) || 0) + (parseInt(tf.amountMSEXO) || 0) +
      (parseInt(tf.amountMSSP) || 0) + (parseInt(tf.amountMSSPO) || 0) +
      (parseInt(tf.amountMSTEAMS) || 0) + (parseInt(tf.amountFS) || 0) +
      (parseInt(tf.amountSAPAPP) || 0) + (parseInt(tf.amountLDAP) || 0) +
      (parseInt(tf.amountSTAR) || 0) + amountSAPHCM;

    const addSrv = (role: string, stage: string, def: { key: string; cpu: number; ram: number }, sto: number, bsto: number) => {
      arr.push(new FormGroup({
        role: new FormControl(role), stage: new FormControl(stage), size: new FormControl(def.key),
        cpu: new FormControl(def.cpu), ram: new FormControl(def.ram),
        storage: new FormControl(sto), backupstorage: new FormControl(bsto)
      }), { emitEvent: false });
    };

    if (sizingMode === 'container' || sizingMode === 'container-minimalistic') {
      const containerDefs = (this.pricing.containerSizingDefs?.length > 0)
        ? this.pricing.containerSizingDefs
        : DEFAULT_PRICING.containerSizingDefs;
      const nodeCount = this.pricing.dockerCluster?.nodes || 2;

      let nodeSizeKey: string;
      if (amountIdentities < 2500)      nodeSizeKey = 'S';
      else if (amountIdentities < 5000) nodeSizeKey = 'M';
      else if (amountIdentities < 8500) nodeSizeKey = 'L';
      else                              nodeSizeKey = 'XL';

      const nodeDef = containerDefs.find(c => c.key === nodeSizeKey) ?? containerDefs[containerDefs.length - 1];

      if (sizingMode === 'container-minimalistic') {
        for (let i = 0; i < nodeCount; i++) addSrv('Node', 'All', nodeDef, nodeDef.storage, Math.round(nodeDef.storage / 2));
      } else {
        for (let i = 0; i < nodeCount; i++) addSrv('Node', 'Prod', nodeDef, nodeDef.storage, Math.round(nodeDef.storage / 2));
        if (stages === 3) {
          for (let i = 0; i < nodeCount; i++) addSrv('Node', 'QS/DEV', nodeDef, nodeDef.storage, Math.round(nodeDef.storage / 2));
        } else if (stages >= 2) {
          for (let i = 0; i < nodeCount; i++) addSrv('Node', 'DEV', nodeDef, nodeDef.storage, Math.round(nodeDef.storage / 2));
        }
      }

    } else {
      const minimalistic = sizingMode === 'vm-minimalistic';
      const jobThreshold = this.pricing.consulting.jobServerThreshold || 5;
      const amountJobServerProd = totalSystems > 0 ? Math.ceil(totalSystems / jobThreshold) : 0;
      const amountDBServerProd = servicelevel === 3 ? 2 : 1;

      const sizeDefs = this.pricing.sizingDefs;
      const byKey = (key: string): SizingDef => sizeDefs.find(s => s.key === key) ?? sizeDefs[sizeDefs.length - 1];
      const halfOf = (def: SizingDef): SizingDef =>
        sizeDefs.find(s => s.cpu >= def.cpu / 2 && s.ram >= def.ram / 2) ?? sizeDefs[sizeDefs.length - 1];
      const pick = (key: string): SizingDef => { const bp = byKey(key); return minimalistic ? halfOf(bp) : bp; };

      let webSizeKey: string, webCount: number;
      if (amountIdentities < 2500)      { webSizeKey = 'M'; webCount = 1; }
      else if (amountIdentities < 5000) { webSizeKey = 'L'; webCount = 1; }
      else if (amountIdentities < 8500) { webSizeKey = 'L'; webCount = 2; }
      else                              { webSizeKey = 'XL'; webCount = 2; }

      const dbDef  = pick('XL');
      const webDef = pick(webSizeKey);
      const jobDef = pick('L');
      const envDef = pick('L');

      for (let i = 0; i < amountDBServerProd; i++) addSrv('DB',  'Prod', dbDef,  500, 1000);
      for (let i = 0; i < webCount;           i++) addSrv('Web', 'Prod', webDef, 100,  200);
      for (let i = 0; i < amountJobServerProd; i++) addSrv('Job', 'Prod', jobDef, 100, 200);

      if (stages >= 2) addSrv('DEV', 'DEV', envDef, 200, 500);
      if (stages === 3) addSrv('QS', 'QS', envDef, 200, 500);
    }
  }

  // --- Helpers ---

  normalizePricing(p: Partial<Pricing>): Pricing {
    return {
      roleDefs: (p.roleDefs && p.roleDefs.length > 0) ? p.roleDefs.map(r => ({ ...r })) : DEFAULT_PRICING.roleDefs.map(r => ({ ...r })),
      sizingDefs: (p.sizingDefs && p.sizingDefs.length > 0) ? p.sizingDefs.map(s => ({ ...s })) : DEFAULT_PRICING.sizingDefs.map(s => ({ ...s })),
      containerSizingDefs: (p.containerSizingDefs && p.containerSizingDefs.length > 0) ? p.containerSizingDefs.map(c => ({ ...c })) : DEFAULT_PRICING.containerSizingDefs.map(c => ({ ...c })),
      dockerCluster: p.dockerCluster ? { ...p.dockerCluster } : { ...DEFAULT_PRICING.dockerCluster },
      consulting: { ...DEFAULT_PRICING.consulting, ...(p.consulting || {}) },
      currency: p.currency || 'EUR'
    };
  }

  computeSyncChanges(current: Pricing, admin: Pricing): SyncChange[] {
    const changes: SyncChange[] = [];
    const c = current.consulting;
    const a = admin.consulting;

    if (c.ptPerStage !== a.ptPerStage)
      changes.push({ label: 'PT pro Stage', oldVal: String(c.ptPerStage), newVal: String(a.ptPerStage) });
    if (c.ptPerServerPerMonth !== a.ptPerServerPerMonth)
      changes.push({ label: 'PT pro Server / Monat', oldVal: String(c.ptPerServerPerMonth), newVal: String(a.ptPerServerPerMonth) });
    if (c.ptPer1000IdentitiesPerMonth !== a.ptPer1000IdentitiesPerMonth)
      changes.push({ label: 'PT pro 1000 Identitäten / Monat', oldVal: String(c.ptPer1000IdentitiesPerMonth), newVal: String(a.ptPer1000IdentitiesPerMonth) });
    if (c.jobServerThreshold !== a.jobServerThreshold)
      changes.push({ label: 'Jobserver-Schwelle', oldVal: `${c.jobServerThreshold} Sys./Server`, newVal: `${a.jobServerThreshold} Sys./Server` });
    if (current.dockerCluster?.nodes !== admin.dockerCluster?.nodes)
      changes.push({ label: 'Docker Cluster Nodes', oldVal: String(current.dockerCluster?.nodes), newVal: String(admin.dockerCluster?.nodes) });
    if (JSON.stringify(current.sizingDefs) !== JSON.stringify(admin.sizingDefs))
      changes.push({ label: 'VM-Sizing Definitionen', oldVal: `${current.sizingDefs?.length} Größen`, newVal: `${admin.sizingDefs?.length} Größen (geändert)` });
    if (JSON.stringify(current.containerSizingDefs) !== JSON.stringify(admin.containerSizingDefs))
      changes.push({ label: 'Container-Sizing Definitionen', oldVal: `${current.containerSizingDefs?.length} Größen`, newVal: `${admin.containerSizingDefs?.length} Größen (geändert)` });

    return changes;
  }

  EditCalcForm: FormGroup = new FormGroup({
    id: new FormControl(null),
    basicform: new FormGroup({
      calculationName: new FormControl(null),
      calculationDesc: new FormControl('')
    }),
    customerform: new FormGroup({
      customerName: new FormControl(null),
      customerEmployees: new FormControl(null)
    }),
    targetsystemsform: new FormGroup({
      licenseOIM: new FormControl(1),
      servicelevel: new FormControl('1'),
      stages: new FormControl(2),
      sizingMode: new FormControl('vm'),
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
