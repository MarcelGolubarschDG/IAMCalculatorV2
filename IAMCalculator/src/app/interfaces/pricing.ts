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
}

export interface ServerRoleDef {
  key: string;
  label: string;
  singleton: boolean;
  minSize: string;
  cpuPer1000: number;
  ramPer1000: number;
}

export interface ConsultingConfig {
  ptPerStage: number;
  ptPerServerPerMonth: number;
  ptPer1000IdentitiesPerMonth: number;
  jobServerThreshold: number;
}

export interface Pricing {
  roleDefs: ServerRoleDef[];
  sizingDefs: SizingDef[];
  containerSizingDefs: ContainerSizingDef[];
  dockerCluster: DockerClusterConfig;
  consulting: ConsultingConfig;
  currency: string;
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
  { key: 'jobservice',          label: 'Jobservice',             singleton: false, minSize: 'XS', cpuPer1000: 0.5, ramPer1000: 0.5  },
  { key: 'dbagent',             label: 'DB-Agent',               singleton: true,  minSize: 'S',  cpuPer1000: 1.0, ramPer1000: 2.0  },
  { key: 'webserver',           label: 'Webserver',              singleton: false, minSize: 'XS', cpuPer1000: 0.5, ramPer1000: 1.0  },
  { key: 'appserver',           label: 'Appserver',              singleton: false, minSize: 'S',  cpuPer1000: 1.0, ramPer1000: 1.5  },
  { key: 'webserver_appserver', label: 'Webserver + Appserver',  singleton: false, minSize: 'S',  cpuPer1000: 1.5, ramPer1000: 2.0  },
  { key: 'jobservice_dbagent',  label: 'Jobservice + DB-Agent',  singleton: false, minSize: 'S',  cpuPer1000: 1.5, ramPer1000: 2.5  },
  { key: 'mssql',               label: 'MSSQL Server',           singleton: false, minSize: 'M',  cpuPer1000: 0.5, ramPer1000: 1.0  },
];

export const DEFAULT_CONTAINER_SIZING_DEFS: ContainerSizingDef[] = [
  { key: 'S',  cpu: 4,  ram: 8,  storage: 200  },
  { key: 'M',  cpu: 8,  ram: 16, storage: 300  },
  { key: 'L',  cpu: 16, ram: 32, storage: 500  },
  { key: 'XL', cpu: 32, ram: 64, storage: 1000 },
];

export const DEFAULT_DOCKER_CLUSTER: DockerClusterConfig = {
  nodes: 2
};

export const DEFAULT_CONSULTING: ConsultingConfig = {
  ptPerStage: 5,
  ptPerServerPerMonth: 0.5,
  ptPer1000IdentitiesPerMonth: 0.1,
  jobServerThreshold: 5,
};

export const DEFAULT_PRICING: Pricing = {
  roleDefs: DEFAULT_ROLE_DEFS,
  sizingDefs: DEFAULT_SIZING_DEFS,
  containerSizingDefs: DEFAULT_CONTAINER_SIZING_DEFS,
  dockerCluster: DEFAULT_DOCKER_CLUSTER,
  consulting: DEFAULT_CONSULTING,
  currency: 'EUR'
};

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

export const SERVER_SIZES: ServerSize[] = DEFAULT_SIZING_DEFS.map(s => s.key);
export const SERVER_ROLE_DEFS = DEFAULT_ROLE_DEFS;
