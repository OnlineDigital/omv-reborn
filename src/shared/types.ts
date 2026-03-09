// Shared TypeScript types for OMV Reborn

export interface WSMessage {
  type: 'request' | 'response' | 'event' | 'error';
  id: string;
  method?: string;
  params?: object;
  result?: any;
  error?: { code: number; message: string };
  progress?: number;
  event?: string;
  data?: any;
}

export interface SystemStats {
  cpu: number;
  memory: { total: number; used: number; free: number; percent: number };
  disk: { total: number; used: number; free: number; percent: number };
  uptime: number;
  load: [number, number, number];
}

export interface Disk {
  devicefile: string;
  model: string;
  size: number;
  serialnumber: string;
  isroot: boolean;
  isvirtual: boolean;
  mountpoint?: { uuid: string; dir: string; type: string }[];
}

export interface MountPoint {
  uuid: string;
  dir: string;
  type: string;
  devicefile: string;
  opts: string;
}

export interface Service {
  name: string;
  title: string;
  enable: boolean;
  running: boolean;
}

export interface Share {
  uuid: string;
  type: 'smb' | 'nfs';
  name: string;
  comment: string;
  path: string;
  public: boolean;
}

export interface ShareInput {
  type: 'smb' | 'nfs';
  name: string;
  comment: string;
  path: string;
  public: boolean;
}

export interface NetworkInterface {
  iface: string;
  method: 'dhcp' | 'manual';
  address: string;
  netmask: string;
  gateway?: string;
  macaddress: string;
  mtu: number;
  flags: string[];
  dns?: string[];
}

export interface NetworkConfig {
  iface: string;
  method: 'dhcp' | 'manual';
  address?: string;
  netmask?: string;
  gateway?: string;
  dns?: string[];
}

export interface User {
  name: string;
  uid: number;
  gid: number;
  shell: string;
  homedir: string;
  email?: string;
  groups: string[];
}

export interface UserInput {
  username: string;
  password?: string;
  email?: string;
  shell: string;
  groups: string[];
}

export interface Group {
  name: string;
  gid: number;
  members: string[];
}

export interface GroupInput {
  groupname: string;
  members: string[];
}

export interface SystemInfo {
  hostname: string;
  version: string;
  distro: string;
  kernel: string;
  arch: string;
  uptime: number;
}

// RPC Methods
export interface RPCMethods {
  // System
  'System.getInfo': () => Promise<SystemInfo>;
  'System.getStats': () => Promise<SystemStats>;
  
  // Storage
  'Storage.getDisks': () => Promise<Disk[]>;
  'Storage.getMountPoints': () => Promise<MountPoint[]>;
  
  // Services
  'Service.getAll': () => Promise<Service[]>;
  'Service.setEnabled': (name: string, enabled: boolean) => Promise<void>;
  'Service.setRunning': (name: string, running: boolean) => Promise<void>;
  
  // Shares
  'Share.getAll': () => Promise<Share[]>;
  
  // Network
  'Network.getInterfaces': () => Promise<NetworkInterface[]>;
  
  // Users
  'User.getAll': () => Promise<User[]>;
  'Group.getAll': () => Promise<Group[]>;
  
  // Power
  'System.reboot': () => Promise<void>;
  'System.shutdown': () => Promise<void>;
}
