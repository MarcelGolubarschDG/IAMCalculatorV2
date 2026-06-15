import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ApiService } from '../services/api.service';
import {
  Pricing, DEFAULT_PRICING, DEFAULT_ROLE_DEFS, DEFAULT_SIZING_DEFS, DEFAULT_CONSULTING,
  DEFAULT_CONTAINER_SIZING_DEFS, DEFAULT_DOCKER_CLUSTER,
  ServerRoleDef, SizingDef, ContainerSizingDef, ConsultingConfig, recommendSize
} from '../interfaces/pricing';

interface PreviewRow {
  count: number;
  reqCpu: number;
  reqRam: number;
  size: SizingDef | null;
  overflowCpu: number;
  overflowRam: number;
}

@Component({
  selector: 'app-pricing-config',
  templateUrl: './pricing-config.component.html',
  styleUrl: './pricing-config.component.css',
  standalone: false
})
export class PricingConfigComponent implements OnInit {

  pricing: Pricing = this.deepDefault();
  loading = true;
  saved = false;

  sizingKeyDraft: string[] = [];
  containerSizingKeyDraft: string[] = [];
  previewRoleKey = 'webserver';

  readonly previewCounts = [500, 1000, 2500, 5000, 10000];

  constructor(private apiService: ApiService, private location: Location) {}

  ngOnInit() {
    this.apiService.getPricing().subscribe(p => {
      if (p) this.pricing = this.merge(p);
      this.sizingKeyDraft = this.pricing.sizingDefs.map(s => s.key);
      this.containerSizingKeyDraft = this.pricing.containerSizingDefs.map(c => c.key);
      if (!this.pricing.roleDefs.find(r => r.key === this.previewRoleKey)) {
        this.previewRoleKey = this.pricing.roleDefs[0]?.key || '';
      }
      this.loading = false;
    });
  }

  // ─── Sizing CRUD ────────────────────────────────────────────────────────────

  addSize() {
    const newKey = 'NEW';
    this.pricing.sizingDefs.push({
      key: newKey, cpu: 0, ram: 0, storage: 0, backupStorage: 0,
      slaBs: '99.5%', slaBc: '99.9%'
    });
    this.sizingKeyDraft.push(newKey);
  }

  deleteSize(idx: number) {
    const key = this.pricing.sizingDefs[idx].key;
    this.pricing.sizingDefs.splice(idx, 1);
    this.sizingKeyDraft.splice(idx, 1);
    for (const role of this.pricing.roleDefs) {
      if (role.minSize === key) {
        role.minSize = this.pricing.sizingDefs[0]?.key || '';
      }
    }
  }

  applySizeKey(idx: number) {
    const oldKey = this.pricing.sizingDefs[idx].key;
    const newKey = (this.sizingKeyDraft[idx] || '').trim().toUpperCase();
    if (!newKey || newKey === oldKey) {
      this.sizingKeyDraft[idx] = oldKey;
      return;
    }
    for (const role of this.pricing.roleDefs) {
      if (role.minSize === oldKey) role.minSize = newKey;
    }
    this.pricing.sizingDefs[idx].key = newKey;
    this.sizingKeyDraft[idx] = newKey;
  }

  // ─── Container Sizing CRUD ──────────────────────────────────────────────────

  addContainerSize() {
    const newKey = 'NEW';
    this.pricing.containerSizingDefs.push({ key: newKey, cpu: 0, ram: 0, storage: 0 });
    this.containerSizingKeyDraft.push(newKey);
  }

  deleteContainerSize(idx: number) {
    this.pricing.containerSizingDefs.splice(idx, 1);
    this.containerSizingKeyDraft.splice(idx, 1);
  }

  applyContainerSizeKey(idx: number) {
    const oldKey = this.pricing.containerSizingDefs[idx].key;
    const newKey = (this.containerSizingKeyDraft[idx] || '').trim().toUpperCase();
    if (!newKey || newKey === oldKey) {
      this.containerSizingKeyDraft[idx] = oldKey;
      return;
    }
    this.pricing.containerSizingDefs[idx].key = newKey;
    this.containerSizingKeyDraft[idx] = newKey;
  }

  // ─── Role CRUD ──────────────────────────────────────────────────────────────

  addRole() {
    const key = 'role_' + Date.now();
    this.pricing.roleDefs.push({
      key, label: 'Neue Rolle', singleton: false,
      minSize: this.pricing.sizingDefs[0]?.key || 'XS',
      cpuPer1000: 0.5,
      ramPer1000: 1.0
    });
  }

  deleteRole(idx: number) {
    const key = this.pricing.roleDefs[idx].key;
    this.pricing.roleDefs.splice(idx, 1);
    if (this.previewRoleKey === key) {
      this.previewRoleKey = this.pricing.roleDefs[0]?.key || '';
    }
  }

  // ─── Sizing preview ──────────────────────────────────────────────────────────

  get sizingPreview(): PreviewRow[] {
    const role = this.pricing.roleDefs.find(r => r.key === this.previewRoleKey)
      || this.pricing.roleDefs[0];
    if (!role) return [];
    const minDef = this.pricing.sizingDefs.find(s => s.key === role.minSize)
      || this.pricing.sizingDefs[0];
    return this.previewCounts.map(count => {
      const reqCpu = round1((minDef?.cpu || 0) + (count / 1000) * role.cpuPer1000);
      const reqRam = round1((minDef?.ram || 0) + (count / 1000) * role.ramPer1000);
      const rec = recommendSize(role, this.pricing.sizingDefs, count);
      return { count, reqCpu, reqRam, ...rec };
    });
  }

  get previewRoleLabel(): string {
    return this.pricing.roleDefs.find(r => r.key === this.previewRoleKey)?.label || '–';
  }

  trackByKey(_: number, item: { key: string }) { return item.key; }

  // ─── Save ───────────────────────────────────────────────────────────────────

  save() {
    this.apiService.updatePricing(this.pricing).subscribe(() => {
      this.saved = true;
      setTimeout(() => this.saved = false, 2500);
    });
  }

  fmtNum(val: number): string {
    return new Intl.NumberFormat('de-DE').format(val);
  }

  goBack() { this.location.back(); }

  // ─── Init helpers ────────────────────────────────────────────────────────────

  private deepDefault(): Pricing {
    return {
      roleDefs: DEFAULT_ROLE_DEFS.map(r => ({ ...r })),
      sizingDefs: DEFAULT_SIZING_DEFS.map(s => ({ ...s })),
      containerSizingDefs: DEFAULT_CONTAINER_SIZING_DEFS.map(c => ({ ...c })),
      dockerCluster: { ...DEFAULT_DOCKER_CLUSTER },
      consulting: { ...DEFAULT_CONSULTING },
      currency: 'EUR'
    };
  }

  private merge(p: Partial<Pricing>): Pricing {
    const consulting: ConsultingConfig = p.consulting
      ? { ...DEFAULT_CONSULTING, ...p.consulting }
      : { ...DEFAULT_CONSULTING };
    return {
      roleDefs: (p.roleDefs && p.roleDefs.length > 0) ? p.roleDefs.map(r => ({ ...r })) : DEFAULT_ROLE_DEFS.map(r => ({ ...r })),
      sizingDefs: (p.sizingDefs && p.sizingDefs.length > 0) ? p.sizingDefs.map(s => ({ ...s })) : DEFAULT_SIZING_DEFS.map(s => ({ ...s })),
      containerSizingDefs: (p.containerSizingDefs && p.containerSizingDefs.length > 0) ? p.containerSizingDefs.map(c => ({ ...c })) : DEFAULT_CONTAINER_SIZING_DEFS.map(c => ({ ...c })),
      dockerCluster: p.dockerCluster ? { ...p.dockerCluster } : { ...DEFAULT_DOCKER_CLUSTER },
      consulting,
      currency: p.currency || 'EUR'
    };
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
