export interface SizingDef {
  key: string;
  cpu: number;
  ram: number;
  storage: number;
  backupStorage: number;
  slaBs: string;
  slaBc: string;
}

export interface ContainerSizingDef {
  key: string;
  cpu: number;
  ram: number;
  storage: number;
}

export interface DockerClusterConfig {
  nodes: number;
  nodeRoleLabel: string;
}

export const INFRASTRUCTURE_ROLE_USAGES = ['none', 'database', 'dbagent', 'web', 'job', 'environment'] as const;
export type InfrastructureRoleUsage = typeof INFRASTRUCTURE_ROLE_USAGES[number];

export interface ServerRoleDef {
  key: string;
  label: string;
  singleton: boolean;
  minSize: string;
  cpuPer1000: number;
  ramPer1000: number;
  infraRole?: InfrastructureRoleUsage;
  protected?: boolean;
}

export interface ConsultingConfig {
  ptPerStage: number;
  ptPerServerPerMonth: number;
  ptPer1000IdentitiesPerMonth: number;
  jobServerThreshold: number;
  webServerSessionCapacity: number;
}

export interface Pricing {
  roleDefs: ServerRoleDef[];
  sizingDefs: SizingDef[];
  containerSizingDefs: ContainerSizingDef[];
  dockerCluster: DockerClusterConfig;
  consulting: ConsultingConfig;
  currency: string;
}

export interface InfrastructureCalculationInput {
  stages: number;
  servicelevel: number;
  amountIdentities: number;
  totalSystems: number;
  sizingMode: string;
  mssqlRedundancy?: boolean;
  webRedundancy?: boolean;
}

export interface InfrastructureServer {
  role: string;
  stage: string;
  size: string;
  cpu: number;
  ram: number;
  storage: number;
  backupstorage: number;
}

export type ServerSize = string;

export const DEFAULT_SIZING_DEFS: SizingDef[] = [
  { key: 'XS', cpu: 2,  ram: 4,   storage: 50,   backupStorage: 25,  slaBs: '99.0%', slaBc: '99.5%'  },
  { key: 'S',  cpu: 4,  ram: 8,   storage: 100,  backupStorage: 50,  slaBs: '99.5%', slaBc: '99.9%'  },
  { key: 'M',  cpu: 8,  ram: 16,  storage: 200,  backupStorage: 100, slaBs: '99.5%', slaBc: '99.9%'  },
  { key: 'L',  cpu: 16, ram: 32,  storage: 500,  backupStorage: 250, slaBs: '99.9%', slaBc: '99.99%' },
  { key: 'XL', cpu: 32, ram: 64,  storage: 1000, backupStorage: 500, slaBs: '99.9%', slaBc: '99.99%' },
];

export const DEFAULT_ROLE_DEFS: ServerRoleDef[] = [
  { key: 'mssql',               label: 'MSSQL Server',           singleton: false, minSize: 'M',  cpuPer1000: 0.5, ramPer1000: 1.0, infraRole: 'database',  protected: true  },
  { key: 'dbagent',             label: 'DB-Agent',               singleton: false, minSize: 'S',  cpuPer1000: 1.0, ramPer1000: 2.0, infraRole: 'dbagent',   protected: true  },
  { key: 'webserver',           label: 'Webserver',              singleton: false, minSize: 'XS', cpuPer1000: 0.5, ramPer1000: 1.0, infraRole: 'web',       protected: true  },
  { key: 'jobservice',          label: 'Jobservice',             singleton: false, minSize: 'XS', cpuPer1000: 0.5, ramPer1000: 0.5, infraRole: 'job'                         },
  { key: 'appserver',           label: 'Appserver',              singleton: false, minSize: 'S',  cpuPer1000: 1.0, ramPer1000: 1.5, infraRole: 'none'                        },
  { key: 'webserver_appserver', label: 'Webserver + Appserver',  singleton: false, minSize: 'S',  cpuPer1000: 1.5, ramPer1000: 2.0, infraRole: 'none'                        },
  { key: 'jobservice_dbagent',  label: 'Jobservice + DB-Agent',  singleton: false, minSize: 'S',  cpuPer1000: 1.5, ramPer1000: 2.5, infraRole: 'environment'                 },
];

export const DEFAULT_CONTAINER_SIZING_DEFS: ContainerSizingDef[] = [
  { key: 'S',  cpu: 4,  ram: 8,  storage: 200  },
  { key: 'M',  cpu: 8,  ram: 16, storage: 300  },
  { key: 'L',  cpu: 16, ram: 32, storage: 500  },
  { key: 'XL', cpu: 32, ram: 64, storage: 1000 },
];

export const DEFAULT_DOCKER_CLUSTER: DockerClusterConfig = {
  nodes: 2,
  nodeRoleLabel: 'Node'
};

export const DEFAULT_CONSULTING: ConsultingConfig = {
  ptPerStage: 5,
  ptPerServerPerMonth: 0.5,
  ptPer1000IdentitiesPerMonth: 0.1,
  jobServerThreshold: 5,
  webServerSessionCapacity: 500,
};

export const DEFAULT_PRICING: Pricing = {
  roleDefs: DEFAULT_ROLE_DEFS,
  sizingDefs: DEFAULT_SIZING_DEFS,
  containerSizingDefs: DEFAULT_CONTAINER_SIZING_DEFS,
  dockerCluster: DEFAULT_DOCKER_CLUSTER,
  consulting: DEFAULT_CONSULTING,
  currency: 'EUR'
};

export function normalizePricingConfig(p: Partial<Pricing> | null | undefined): Pricing {
  const source = p || {};
  return {
    roleDefs: normalizeRoleDefs(source.roleDefs),
    sizingDefs: (source.sizingDefs && source.sizingDefs.length > 0) ? source.sizingDefs.map(s => ({ ...s })) : DEFAULT_SIZING_DEFS.map(s => ({ ...s })),
    containerSizingDefs: (source.containerSizingDefs && source.containerSizingDefs.length > 0) ? source.containerSizingDefs.map(c => ({ ...c })) : DEFAULT_CONTAINER_SIZING_DEFS.map(c => ({ ...c })),
    dockerCluster: { ...DEFAULT_DOCKER_CLUSTER, ...(source.dockerCluster || {}) },
    consulting: { ...DEFAULT_CONSULTING, ...(source.consulting || {}) },
    currency: source.currency || DEFAULT_PRICING.currency
  };
}

function normalizeRoleDefs(roleDefs: ServerRoleDef[] | undefined): ServerRoleDef[] {
  const source = (roleDefs && roleDefs.length > 0) ? roleDefs : DEFAULT_ROLE_DEFS;
  return source.map(role => {
    const defaultRole = DEFAULT_ROLE_DEFS.find(item => item.key === role.key);
    const fallbackUsage = defaultRole?.infraRole || 'none';
    return {
      ...role,
      infraRole: normalizeInfraRoleUsage(role.infraRole, fallbackUsage),
      protected: defaultRole?.protected ?? role.protected ?? false
    };
  });
}

function normalizeInfraRoleUsage(value: unknown, fallback: InfrastructureRoleUsage): InfrastructureRoleUsage {
  return INFRASTRUCTURE_ROLE_USAGES.includes(value as InfrastructureRoleUsage)
    ? value as InfrastructureRoleUsage
    : fallback;
}

/**
 * Given a role and an identity count, returns the recommended SizingDef.
 * Uses minSize as the resource baseline, adds cpuPer1000/ramPer1000 * count/1000,
 * then picks the smallest eligible size that covers both.
 * If no size is large enough, returns the largest with overflow values.
 */
export function recommendSize(
  role: ServerRoleDef,
  sizingDefs: SizingDef[],
  identityCount: number
): { size: SizingDef | null; overflowCpu: number; overflowRam: number } {
  const minIdx = sizingDefs.findIndex(s => s.key === role.minSize);
  const eligible = minIdx >= 0 ? sizingDefs.slice(minIdx) : [...sizingDefs];
  if (!eligible.length) return { size: null, overflowCpu: 0, overflowRam: 0 };

  const base = eligible[0];
  const requiredCpu = base.cpu + (identityCount / 1000) * role.cpuPer1000;
  const requiredRam = base.ram + (identityCount / 1000) * role.ramPer1000;

  for (const s of eligible) {
    if (s.cpu >= requiredCpu && s.ram >= requiredRam) {
      return { size: s, overflowCpu: 0, overflowRam: 0 };
    }
  }

  const largest = eligible[eligible.length - 1];
  return {
    size: largest,
    overflowCpu: Math.round((requiredCpu - largest.cpu) * 10) / 10,
    overflowRam:  Math.round((requiredRam  - largest.ram)  * 10) / 10,
  };
}

export function calculateInfrastructureServers(
  pricingConfig: Pricing,
  input: InfrastructureCalculationInput
): InfrastructureServer[] {
  const pricing = normalizePricingConfig(pricingConfig);
  const sizingMode = input.sizingMode || 'vm';

  if (sizingMode === 'container' || sizingMode === 'container-minimalistic') {
    return calculateContainerInfrastructure(pricing, input);
  }

  return calculateVmInfrastructure(pricing, input);
}

export function summarizeInfrastructureServers(servers: InfrastructureServer[]): string {
  const grouped = new Map<string, InfrastructureServer & { count: number }>();

  for (const server of servers) {
    const key = `${server.stage}|${server.role}|${server.size}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, { ...server, count: 1 });
    }
  }

  const parts = Array.from(grouped.values()).map(item =>
    `${item.count}x ${item.role} ${item.stage} (${item.size})`
  );
  if (parts.length <= 4) return parts.join(', ');

  return `${parts.slice(0, 4).join(', ')} + ${parts.length - 4} weitere`;
}

function calculateContainerInfrastructure(
  pricing: Pricing,
  input: InfrastructureCalculationInput
): InfrastructureServer[] {
  const servers: InfrastructureServer[] = [];
  const containerDefs = pricing.containerSizingDefs.length > 0
    ? pricing.containerSizingDefs
    : DEFAULT_CONTAINER_SIZING_DEFS;
  const nodeDef = pickContainerSize(containerDefs, safeNumber(input.amountIdentities));
  const nodeCount = Math.max(1, safeNumber(pricing.dockerCluster.nodes) || DEFAULT_DOCKER_CLUSTER.nodes);
  const nodeRole = pricing.dockerCluster.nodeRoleLabel || DEFAULT_DOCKER_CLUSTER.nodeRoleLabel || 'Node';
  const stages = safeNumber(input.stages);

  if (!nodeDef) return servers;

  if (input.sizingMode === 'container-minimalistic') {
    addRepeated(servers, nodeRole, 'All', nodeDef, nodeCount);
    return servers;
  }

  addRepeated(servers, nodeRole, 'Prod', nodeDef, nodeCount);
  if (stages === 3) {
    addRepeated(servers, nodeRole, 'QS/DEV', nodeDef, nodeCount);
  } else if (stages >= 2) {
    addRepeated(servers, nodeRole, 'DEV', nodeDef, nodeCount);
  }

  return servers;
}

function calculateVmInfrastructure(
  pricing: Pricing,
  input: InfrastructureCalculationInput
): InfrastructureServer[] {
  const servers: InfrastructureServer[] = [];
  const minimalistic = input.sizingMode === 'vm-minimalistic';
  const amountIdentities = safeNumber(input.amountIdentities);
  const totalSystems = safeNumber(input.totalSystems);
  const stages = safeNumber(input.stages);
  const jobThreshold = Math.max(1, safeNumber(pricing.consulting.jobServerThreshold) || DEFAULT_CONSULTING.jobServerThreshold);
  const sessionCapacity = Math.max(1, safeNumber(pricing.consulting.webServerSessionCapacity) || DEFAULT_CONSULTING.webServerSessionCapacity);

  const mssqlRole    = findInfrastructureRole(pricing, 'database');
  const dbagentRole  = findInfrastructureRole(pricing, 'dbagent');
  const webRole      = findInfrastructureRole(pricing, 'web');
  const jobRole      = findInfrastructureRole(pricing, 'job');
  const envRole      = findInfrastructureRole(pricing, 'environment');

  // MSSQL: always 1×; redundancy doubles it (disabled in minimalistic)
  const mssqlCount = (!minimalistic && input.mssqlRedundancy) ? 2 : 1;

  // DB-Agent: always exactly 1×
  const dbagentCount = 1;

  // Webserver: scale by active sessions (4% of identities / capacity per server)
  const baseWebCount = Math.max(1, Math.ceil((amountIdentities * 0.04) / sessionCapacity));
  const webCount = (!minimalistic && input.webRedundancy) ? baseWebCount * 2 : baseWebCount;

  // Jobserver: ceil(systems / threshold), 0 if no systems
  const jobCount = totalSystems > 0 ? Math.ceil(totalSystems / jobThreshold) : 0;

  addRoleServers(servers, pricing, mssqlRole,   'Prod', amountIdentities, minimalistic, mssqlCount);
  addRoleServers(servers, pricing, dbagentRole,  'Prod', amountIdentities, minimalistic, dbagentCount);
  addRoleServers(servers, pricing, webRole,      'Prod', amountIdentities, minimalistic, webCount);
  addRoleServers(servers, pricing, jobRole,      'Prod', amountIdentities, minimalistic, jobCount);

  if (stages >= 2) {
    addRoleServers(servers, pricing, envRole, 'DEV', amountIdentities, minimalistic, 1);
  }
  if (stages === 3) {
    addRoleServers(servers, pricing, envRole, 'QS', amountIdentities, minimalistic, 1);
  }

  return servers;
}

function findInfrastructureRole(
  pricing: Pricing,
  usage: Exclude<InfrastructureRoleUsage, 'none'>
): ServerRoleDef | null {
  return pricing.roleDefs.find(role => role.infraRole === usage) || null;
}

function addRoleServers(
  servers: InfrastructureServer[],
  pricing: Pricing,
  role: ServerRoleDef | null,
  stage: string,
  amountIdentities: number,
  minimalistic: boolean,
  count: number
): void {
  if (!role || count <= 0) return;

  const def = recommendInfrastructureSize(role, pricing.sizingDefs, amountIdentities, minimalistic);
  if (!def) return;

  addRepeated(servers, role.label, stage, def, count);
}

function recommendInfrastructureSize(
  role: ServerRoleDef,
  sizingDefs: SizingDef[],
  amountIdentities: number,
  minimalistic: boolean
): SizingDef | null {
  const defs = sizingDefs.length > 0 ? sizingDefs : DEFAULT_SIZING_DEFS;
  const recommended = recommendSize(role, defs, amountIdentities).size || defs[defs.length - 1] || null;
  if (!recommended) return null;

  return minimalistic ? compactSize(recommended, defs) : recommended;
}

function compactSize(def: SizingDef, sizingDefs: SizingDef[]): SizingDef {
  return sizingDefs.find(size => size.cpu >= def.cpu / 2 && size.ram >= def.ram / 2)
    || sizingDefs[0]
    || def;
}

function pickContainerSize(containerDefs: ContainerSizingDef[], amountIdentities: number): ContainerSizingDef | null {
  if (!containerDefs.length) return null;
  const tier = identityTier(amountIdentities);
  const index = Math.min(tier, containerDefs.length - 1);
  return containerDefs[index];
}

function identityTier(amountIdentities: number): number {
  if (amountIdentities < 2500) return 0;
  if (amountIdentities < 5000) return 1;
  if (amountIdentities < 8500) return 2;
  return 3;
}

function addRepeated(
  servers: InfrastructureServer[],
  role: string,
  stage: string,
  def: SizingDef | ContainerSizingDef,
  count: number
): void {
  for (let i = 0; i < count; i++) {
    servers.push({
      role,
      stage,
      size: def.key,
      cpu: def.cpu,
      ram: def.ram,
      storage: def.storage,
      backupstorage: 'backupStorage' in def ? def.backupStorage : Math.round(def.storage / 2)
    });
  }
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export const SERVER_SIZES: ServerSize[] = DEFAULT_SIZING_DEFS.map(s => s.key);
export const SERVER_ROLE_DEFS = DEFAULT_ROLE_DEFS;
