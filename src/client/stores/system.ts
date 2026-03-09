// SolidJS Store for system state
import { createSignal, createEffect, onCleanup } from 'solid-js';
import type { SystemStats, Disk, MountPoint, Service, Share, NetworkInterface, User, Group, SystemInfo, WSMessage, ShareInput, UserInput, GroupInput, NetworkConfig } from '../shared/types.ts';

const WS_URL = `ws://${window.location.host}/ws`;

// Signals
const [connected, setConnected] = createSignal(false);
const [systemInfo, setSystemInfo] = createSignal<SystemInfo | null>(null);
const [stats, setStats] = createSignal<SystemStats | null>(null);
const [disks, setDisks] = createSignal<Disk[]>([]);
const [mountPoints, setMountPoints] = createSignal<MountPoint[]>([]);
const [services, setServices] = createSignal<Service[]>([]);
const [shares, setShares] = createSignal<Share[]>([]);
const [interfaces, setInterfaces] = createSignal<NetworkInterface[]>([]);
const [users, setUsers] = createSignal<User[]>([]);
const [groups, setGroups] = createSignal<Group[]>([]);

// Additional feature signals
const [cronJobs, setCronJobs] = createSignal<any[]>([]);
const [rsyncJobs, setRsyncJobs] = createSignal<any[]>([]);
const [smartDevices, setSmartDevices] = createSignal<any[]>([]);
const [smartData, setSmartData] = createSignal<any>({});
const [notifications, setNotifications] = createSignal<any[]>([]);
const [rrdData, setRrdData] = createSignal<any>({});
const [aptSettings, setAptSettings] = createSignal<any>({});
const [configData, setConfigData] = createSignal<any>({});

// WebSocket
let ws: WebSocket | null = null;
type PendingRequest = { resolve: (v: any) => void; reject: (e: any) => void; timeoutId?: number };
const pendingRequests = new Map<string, PendingRequest>();
const requestQueue: Array<{ id: string; method: string; params: object; resolve: (v: any) => void; reject: (e: any) => void; timeoutId: number }> = [];

function processQueue() {
  while (requestQueue.length > 0 && ws?.readyState === WebSocket.OPEN) {
    const queued = requestQueue.shift()!;
    
    // Set up a new timeout for this request
    const timeoutId = window.setTimeout(() => {
      if (pendingRequests.has(queued.id)) {
        pendingRequests.delete(queued.id);
        queued.reject(new Error('Request timeout'));
      }
    }, 30000);
    
    ws.send(JSON.stringify({
      type: 'request',
      id: queued.id,
      method: queued.method,
      params: queued.params,
    }));
    pendingRequests.set(queued.id, { resolve: queued.resolve, reject: queued.reject, timeoutId });
  }
}

export function connectWS() {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;
  
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    setConnected(true);
    console.log('WS connected');
    // Process any queued requests
    processQueue();
  };
  
  ws.onmessage = (event) => {
    const msg: WSMessage = JSON.parse(event.data);
    
    if (msg.type === 'response' || msg.type === 'error') {
      const pending = pendingRequests.get(msg.id);
      if (pending) {
        pendingRequests.delete(msg.id);
        // Clear timeout
        if (pending.timeoutId) {
          clearTimeout(pending.timeoutId);
        }
        if (msg.type === 'error') {
          pending.reject(new Error(msg.error?.message || 'Unknown error'));
        } else {
          pending.resolve(msg.result);
        }
      }
    } else if (msg.type === 'event') {
      if (msg.event === 'system:stats') {
        setStats(msg.data);
      }
    }
  };
  
  ws.onclose = () => {
    setConnected(false);
    console.log('WS disconnected, reconnecting...');
    
    // Clear pending requests that were in-flight (they failed due to disconnect)
    // Keep the requestQueue - those requests will be sent when WebSocket reconnects
    pendingRequests.forEach((req) => {
      if (req.timeoutId) clearTimeout(req.timeoutId);
      req.reject(new Error('WebSocket disconnected'));
    });
    pendingRequests.clear();
    
    setTimeout(connectWS, 3000);
  };
  
  ws.onerror = (err) => {
    console.error('WS error:', err);
  };
}

function sendRequest<T>(method: string, params: object = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    
    // If WebSocket is open, send immediately
    if (ws && ws.readyState === WebSocket.OPEN) {
      const timeoutId = window.setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
      
      pendingRequests.set(id, { resolve: resolve as (v: any) => void, reject, timeoutId });
      
      ws.send(JSON.stringify({
        type: 'request',
        id,
        method,
        params,
      }));
      
      return;
    }
    
    // WebSocket not ready - queue the request
    const timeoutId = window.setTimeout(() => {
      // Remove from queue if still waiting
      const idx = requestQueue.findIndex(q => q.id === id);
      if (idx !== -1) {
        requestQueue.splice(idx, 1);
        reject(new Error('Request timeout'));
      }
    }, 30000);
    
    requestQueue.push({ id, method, params, resolve: resolve as (v: any) => void, reject, timeoutId });
  });
}

// API methods
export const api = {
  // System
  getSystemInfo: () => sendRequest<SystemInfo>('System.getInfo').then(setSystemInfo),
  getStats: () => sendRequest<SystemStats>('System.getStats').then(setStats),
  
  // Storage
  getDisks: () => sendRequest<Disk[]>('Storage.getDisks').then(setDisks),
  getMountPoints: () => sendRequest<MountPoint[]>('Storage.getMountPoints').then(setMountPoints),
  
  // Services
  getServices: () => sendRequest<Service[]>('Service.getAll').then(setServices),
  setServiceEnabled: (name: string, enabled: boolean) => 
    sendRequest('Service.setEnabled', { name, enabled }).then(() => api.getServices()),
  setServiceRunning: (name: string, running: boolean) =>
    sendRequest('Service.setRunning', { name, running }).then(() => api.getServices()),
  
  // Shares
  getShares: () => sendRequest<Share[]>('Share.getAll').then(setShares),
  createShare: (share: ShareInput) => 
    sendRequest('Share.create', share).then(() => api.getShares()),
  updateShare: (uuid: string, share: ShareInput) =>
    sendRequest('Share.update', { uuid, ...share }).then(() => api.getShares()),
  deleteShare: (uuid: string) =>
    sendRequest('Share.delete', { uuid }).then(() => api.getShares()),
  
  // Network
  getInterfaces: () => sendRequest<NetworkInterface[]>('Network.getInterfaces').then(setInterfaces),
  setInterface: (config: NetworkConfig) =>
    sendRequest('Network.setInterface', config).then(() => api.getInterfaces()),
  
  // Users
  getUsers: () => sendRequest<User[]>('User.getAll').then(setUsers),
  createUser: (user: UserInput) =>
    sendRequest('User.create', user).then(() => api.getUsers()),
  updateUser: (username: string, user: UserInput) =>
    sendRequest('User.update', { username, ...user }).then(() => api.getUsers()),
  deleteUser: (username: string) =>
    sendRequest('User.delete', { username }).then(() => api.getUsers()),
  
  // Groups
  getGroups: () => sendRequest<Group[]>('Group.getAll').then(setGroups),
  createGroup: (group: GroupInput) =>
    sendRequest('Group.create', group).then(() => api.getGroups()),
  updateGroup: (groupname: string, group: GroupInput) =>
    sendRequest('Group.update', { groupname, ...group }).then(() => api.getGroups()),
  deleteGroup: (groupname: string) =>
    sendRequest('Group.delete', { groupname }).then(() => api.getGroups()),
  
  // Power
  reboot: () => sendRequest('System.reboot'),
  shutdown: () => sendRequest('System.shutdown'),
  
  // Cron Jobs
  getCronJobs: () => sendRequest<any[]>('Cron.getJobs').then(setCronJobs),
  setCronJob: (job: any) => sendRequest('Cron.setJob', job).then(() => api.getCronJobs()),
  deleteCronJob: (uuid: string) => sendRequest('Cron.deleteJob', { uuid }).then(() => api.getCronJobs()),
  
  // Rsync Jobs
  getRsyncJobs: () => sendRequest<any[]>('Rsync.getJobs').then(setRsyncJobs),
  setRsyncJob: (job: any) => sendRequest('Rsync.setJob', job).then(() => api.getRsyncJobs()),
  deleteRsyncJob: (uuid: string) => sendRequest('Rsync.deleteJob', { uuid }).then(() => api.getRsyncJobs()),
  runRsyncJob: (uuid: string) => sendRequest('Rsync.runJob', { uuid }),
  
  // SMART Monitoring
  getSmartDevices: () => sendRequest<any[]>('Smart.getDevices').then(setSmartDevices),
  getSmartData: (device: string) => sendRequest<any>('Smart.getData', { device }).then(setSmartData),
  getSmartSettings: () => sendRequest<any>('Smart.getSettings'),
  setSmartSettings: (settings: any) => sendRequest('Smart.setSettings', settings).then(() => api.getSmartSettings()),
  
  // Notifications
  getNotifications: () => sendRequest<any>('Notification.getList').then(r => setNotifications(r?.response?.data || [])),
  sendNotification: (title: string, message: string) => sendRequest('Notification.send', { title, message }),
  
  // RRD Statistics
  getRRDData: (period: string = 'day') => sendRequest<any>('RRD.getGraph', { period }).then(setRrdData),
  
  // APT/Package Management
  getAptSettings: () => sendRequest<any>('Apt.getSettings').then(setAptSettings),
  setAptSettings: (settings: any) => sendRequest('Apt.setSettings', settings).then(() => api.getAptSettings()),
  updatePackages: () => sendRequest('Apt.update'),
  upgradePackages: () => sendRequest('Apt.upgrade'),
  
  // Config Management
  getConfig: (section: string) => sendRequest<any>('Config.get', { section }).then(setConfigData),
  setConfig: (section: string, config: any) => sendRequest('Config.set', { section, config }),
  applyConfig: () => sendRequest('Config.apply'),
};

// Exports
export {
  connected, systemInfo, stats, disks, mountPoints, 
  services, shares, interfaces, users, groups,
  cronJobs, rsyncJobs, smartDevices, smartData,
  notifications, rrdData, aptSettings, configData,
};
