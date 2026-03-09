// Mock data store for NAS-PRO Dashboard
import { createSignal } from 'solid-js';

// Activity types
export interface Activity {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'progress';
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  progress?: number;
}

// Storage pool types
export interface StoragePool {
  name: string;
  used: number;
  total: number;
  status: 'healthy' | 'scrubbing' | 'degraded' | 'offline';
  raidType: string;
  diskCount: number;
  scrubProgress?: number;
}

// Network stats
export interface NetworkStats {
  rx: number; // Mbps
  tx: number; // Mbps
  rxHistory: number[];
  txHistory: number[];
}

// Disk info
export interface DiskInfo {
  name: string;
  model: string;
  temperature: number;
  usage: number;
  status: 'passed' | 'failed' | 'warning';
}

// Core service
export interface CoreService {
  id: string;
  name: string;
  icon: string;
  running: boolean;
  connections?: number;
  port?: number;
  lastScan?: string;
}

// Mock data signals
const [activities, setActivities] = createSignal<Activity[]>([
  {
    id: '1',
    type: 'success',
    icon: 'folder-plus',
    title: 'New Shared Folder',
    description: "'media_backup' created successfully.",
    timestamp: '2 mins ago',
  },
  {
    id: '2',
    type: 'progress',
    icon: 'download-cloud',
    title: 'Download in Progress',
    description: "'Ubuntu 22.04 ISO'",
    timestamp: '5 mins ago',
    progress: 65,
  },
  {
    id: '3',
    type: 'warning',
    icon: 'copy',
    title: 'File Copy',
    description: "'Photos_2023' (2.4 GB) to 'external_ssd'",
    timestamp: '10 mins ago',
  },
  {
    id: '4',
    type: 'info',
    icon: 'info',
    title: 'System Update',
    description: 'Patch 1.0.4 installed.',
    timestamp: '1 hour ago',
  },
]);

const [storagePools, setStoragePools] = createSignal<StoragePool[]>([
  {
    name: 'tank-media',
    used: 14.2,
    total: 24.0,
    status: 'healthy',
    raidType: 'RAID-Z2',
    diskCount: 6,
    scrubProgress: 100,
  },
  {
    name: 'ssd-cache',
    used: 420,
    total: 2000,
    status: 'scrubbing',
    raidType: 'Mirror',
    diskCount: 2,
    scrubProgress: 42,
  },
]);

const [networkStats, setNetworkStats] = createSignal<NetworkStats>({
  rx: 452.8,
  tx: 12.1,
  rxHistory: [30, 25, 35, 20, 30, 25, 35, 20, 30, 25, 35, 20],
  txHistory: [35, 38, 20, 25, 35, 38, 20, 25, 35, 38, 20, 25],
});

const [diskInfos, setDiskInfos] = createSignal<DiskInfo[]>([
  {
    name: 'sda',
    model: 'WD Red Plus 4TB',
    temperature: 34,
    usage: 82,
    status: 'passed',
  },
  {
    name: 'sdb',
    model: 'WD Red Plus 4TB',
    temperature: 36,
    usage: 82,
    status: 'passed',
  },
  {
    name: 'sdc',
    model: 'Samsung 970 EVO',
    temperature: 41,
    usage: 12,
    status: 'passed',
  },
]);

const [coreServices, setCoreServices] = createSignal<CoreService[]>([
  {
    id: 'smb',
    name: 'Samba (SMB)',
    icon: 'folder-tree',
    running: true,
    connections: 2,
  },
  {
    id: 'ssh',
    name: 'SSH Server',
    icon: 'terminal',
    running: true,
    port: 22,
  },
  {
    id: 'fail2ban',
    name: 'Fail2Ban',
    icon: 'shield-alert',
    running: false,
  },
  {
    id: 'zfs',
    name: 'ZFS Daemon',
    icon: 'workflow',
    running: true,
    lastScan: '2h ago',
  },
]);

// Helper functions
export const mockData = {
  activities,
  setActivities,
  storagePools,
  setStoragePools,
  networkStats,
  setNetworkStats,
  diskInfos,
  setDiskInfos,
  coreServices,
  setCoreServices,

  // Format bytes
  formatBytes: (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // Clear activities
  clearActivities: () => setActivities([]),

  // Toggle service
  toggleService: (id: string) => {
    setCoreServices(prev =>
      prev.map(svc =>
        svc.id === id ? { ...svc, running: !svc.running } : svc
      )
    );
  },
};
