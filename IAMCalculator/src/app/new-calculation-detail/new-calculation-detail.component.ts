import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Pricing, DEFAULT_PRICING, calculateInfrastructureServers, normalizePricingConfig, summarizeInfrastructureServers } from '../interfaces/pricing';
import { Calculation } from '../interfaces/calculation';

export interface SyncChange {
  label: string;
  oldVal: string;
  newVal: string;
}

@Component({
    selector: 'app-new-calculation-detail',
    templateUrl: './new-calculation-detail.component.html',
    styleUrl: './new-calculation-detail.component.css',
    standalone: false
})
export class NewCalculationDetailComponent implements OnInit {

  sapHCMMode: 'none' | 'csv' | 'connector' = 'none';
  disabledLicense = false;

  pricing: Pricing = this.normalizePricing(DEFAULT_PRICING);
  adminPricing: Pricing = this.normalizePricing(DEFAULT_PRICING);

  showSyncConfirm = false;
  showSaveConfirm = false;
  syncChanges: SyncChange[] = [];

  get serverControls() {
    return (this.NewCalcForm.get('servers') as FormArray).controls;
  }

  constructor(
    public apiservice: ApiService,
    private router: Router,
    private location: Location
  ) {}

  get ptStages(): number { return parseInt(this.NewCalcForm.get('targetsystemsform.stages')?.value) || 2; }
  get ptIdentitiesK(): number { return Math.round((parseInt(this.NewCalcForm.get('customerform.customerEmployees')?.value) || 0) / 100) / 10; }
  get isContainerMode(): boolean { const m = this.NewCalcForm.get('targetsystemsform.sizingMode')?.value || 'vm'; return m === 'container' || m === 'container-minimalistic'; }
  get isVmMode(): boolean { const m = this.NewCalcForm.get('targetsystemsform.sizingMode')?.value || 'vm'; return m === 'vm' || m === 'vm-minimalistic'; }
  get isMinimalisticMode(): boolean { return this.NewCalcForm.get('targetsystemsform.sizingMode')?.value === 'vm-minimalistic'; }
  get ptForStages(): number { return Math.round(this.pricing.consulting.ptPerStage * this.ptStages * 10) / 10; }
  get ptForServers(): number { return this.isContainerMode ? 2 : Math.round(this.pricing.consulting.ptPerServerPerMonth * this.serverControls.length * 10) / 10; }
  get ptForIdentities(): number { return Math.round(this.pricing.consulting.ptPer1000IdentitiesPerMonth * this.ptIdentitiesK * 10) / 10; }
  get ptIncluded(): number { return parseFloat(this.NewCalcForm.get('consultingform.includedPtPerMonth')?.value) || 0; }
  get totalMonthlyPT(): number { return Math.round((this.ptForStages + this.ptForServers + this.ptForIdentities) * 10) / 10; }

  ngOnInit(): void {
    this.apiservice.getPricing().subscribe(p => {
      if (p && p.sizingDefs) {
        this.adminPricing = this.normalizePricing(p);
        this.pricing = this.normalizePricing(p);
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

  // --- Sync confirm ---

  openSyncConfirm() {
    this.syncChanges = this.computeSyncChanges(this.pricing, this.adminPricing);
    this.showSyncConfirm = true;
  }

  cancelSync() { this.showSyncConfirm = false; }

  confirmSync() {
    this.pricing = this.normalizePricing(this.adminPricing);
    if (this.NewCalcForm.get('customerform.customerEmployees')?.value) {
      this.calcServerSize(this.NewCalcForm.value);
    }
    this.showSyncConfirm = false;
  }

  // --- Save confirm ---

  openSaveConfirm() { this.showSaveConfirm = true; }

  cancelSave() { this.showSaveConfirm = false; }

  confirmSave() {
    this.showSaveConfirm = false;
    this.apiservice.addCalculation(this.buildPayload(this.NewCalcForm.value)).subscribe();
    this.NewCalcForm.reset();
    this.goToPage('/OverviewManagedIAM');
  }

  private buildPayload(data: any): Omit<Calculation, '_id'> {
    const tf = data.targetsystemsform;
    return {
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
        amountSTAR: parseInt(tf.amountSTAR) || 0,
        mssqlRedundancy: tf.mssqlRedundancy || false,
        webRedundancy: tf.webRedundancy || false
      },
      servers: data.servers,
      consultingform: {
        includedPtPerMonth: parseFloat(data.consultingform?.includedPtPerMonth) || 0
      },
      pricingSnapshot: this.normalizePricing(this.pricing)
    };
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

  toggleSAPHCM(mode: 'csv' | 'connector') {
    this.setSAPHCM(this.sapHCMMode === mode ? 'none' : mode);
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

  toggleMssqlRedundancy() {
    if (this.isMinimalisticMode) return;
    const ctrl = this.NewCalcForm.get('targetsystemsform.mssqlRedundancy');
    ctrl?.setValue(!ctrl.value);
  }

  toggleWebRedundancy() {
    if (this.isMinimalisticMode) return;
    const ctrl = this.NewCalcForm.get('targetsystemsform.webRedundancy');
    ctrl?.setValue(!ctrl.value);
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
    const tf = this.NewCalcForm.get('targetsystemsform')?.value;
    const mode = this.NewCalcForm.get('targetsystemsform.sizingMode')?.value || 'vm';
    return summarizeInfrastructureServers(calculateInfrastructureServers(this.pricing, {
      stages: parseInt(tf?.stages) || 2,
      servicelevel: parseInt(tf?.servicelevel) || 1,
      amountIdentities: n,
      totalSystems: this.getTotalTargetSystems(tf),
      sizingMode: mode,
      mssqlRedundancy: tf?.mssqlRedundancy || false,
      webRedundancy: tf?.webRedundancy || false
    }));
  }

  // --- Server calculation ---

  calcServerSize(data: any) {
    const arr = <FormArray>this.NewCalcForm.get('servers');
    while (arr.length !== 0) arr.removeAt(0, { emitEvent: false });

    const tf = data.targetsystemsform;
    const stages = parseInt(tf.stages);
    const servicelevel = parseInt(tf.servicelevel);
    const amountIdentities = parseInt(data.customerform.customerEmployees);
    const sizingMode: string = tf.sizingMode || 'vm';

    const totalSystems = this.getTotalTargetSystems(tf);

    const mssqlRedundancy: boolean = tf.mssqlRedundancy || false;
    const webRedundancy: boolean = tf.webRedundancy || false;

    const servers = calculateInfrastructureServers(this.pricing, {
      stages,
      servicelevel,
      amountIdentities,
      totalSystems,
      sizingMode,
      mssqlRedundancy,
      webRedundancy
    });

    for (const srv of servers) {
      arr.push(new FormGroup({
        role: new FormControl(srv.role), stage: new FormControl(srv.stage), size: new FormControl(srv.size),
        cpu: new FormControl(srv.cpu), ram: new FormControl(srv.ram),
        storage: new FormControl(srv.storage), backupstorage: new FormControl(srv.backupstorage)
      }), { emitEvent: false });
    }
  }

  // --- Helpers ---

  normalizePricing(p: Partial<Pricing>): Pricing {
    return normalizePricingConfig(p);
  }

  trackBySrvIndex(i: number): number { return i; }
  trackBySyncChange(_: number, ch: SyncChange): string { return ch.label; }

  private getTotalTargetSystems(tf: Calculation['targetsystemsform']): number {
    const amountSAPHCM = (tf?.SAPHCMCSV || tf?.SAPHCM) ? 1 : 0;
    return (Number(tf?.amountMSAD) || 0) + (Number(tf?.amountMSAAD) || 0) +
      (Number(tf?.amountMSEX) || 0) + (Number(tf?.amountMSEXO) || 0) +
      (Number(tf?.amountMSSP) || 0) + (Number(tf?.amountMSSPO) || 0) +
      (Number(tf?.amountMSTEAMS) || 0) + (Number(tf?.amountFS) || 0) +
      (Number(tf?.amountSAPAPP) || 0) + (Number(tf?.amountLDAP) || 0) +
      (Number(tf?.amountSTAR) || 0) + amountSAPHCM;
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
    if (c.webServerSessionCapacity !== a.webServerSessionCapacity)
      changes.push({ label: 'Sessions / Webserver', oldVal: `${c.webServerSessionCapacity}`, newVal: `${a.webServerSessionCapacity}` });
    if (JSON.stringify(current.dockerCluster) !== JSON.stringify(admin.dockerCluster))
      changes.push({ label: 'Docker Cluster', oldVal: `${current.dockerCluster?.nodes} Nodes / ${current.dockerCluster?.nodeRoleLabel}`, newVal: `${admin.dockerCluster?.nodes} Nodes / ${admin.dockerCluster?.nodeRoleLabel}` });
    if (JSON.stringify(current.roleDefs) !== JSON.stringify(admin.roleDefs))
      changes.push({ label: 'Serverrollen', oldVal: `${current.roleDefs?.length} Rollen`, newVal: `${admin.roleDefs?.length} Rollen (geändert)` });
    if (JSON.stringify(current.sizingDefs) !== JSON.stringify(admin.sizingDefs))
      changes.push({ label: 'VM-Sizing Definitionen', oldVal: `${current.sizingDefs?.length} Größen`, newVal: `${admin.sizingDefs?.length} Größen (geändert)` });
    if (JSON.stringify(current.containerSizingDefs) !== JSON.stringify(admin.containerSizingDefs))
      changes.push({ label: 'Container-Sizing Definitionen', oldVal: `${current.containerSizingDefs?.length} Größen`, newVal: `${admin.containerSizingDefs?.length} Größen (geändert)` });

    return changes;
  }

  NewCalcForm: FormGroup = new FormGroup({
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
      amountSTAR: new FormControl(0),
      mssqlRedundancy: new FormControl(false),
      webRedundancy: new FormControl(false)
    }),
    servers: new FormArray([]),
    consultingform: new FormGroup({
      includedPtPerMonth: new FormControl(2)
    })
  });
}
