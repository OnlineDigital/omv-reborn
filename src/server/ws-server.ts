// WebSocket Server - handles WS messages and routes to RPC
import type { WSMessage, ShareInput, UserInput, GroupInput, NetworkConfig } from '../shared/types.ts';
import * as rpc from './rpc-client.ts';
import { addClient, removeClient, broadcastProgress } from './events.ts';

interface WSConnection {
  send: (data: string) => void;
  readyState: number;
}

const OPEN = 1;
const CLOSED = 3;

function send(ws: WSConnection, msg: WSMessage) {
  if (ws.readyState === OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function handleMessage(ws: WSConnection, msg: WSMessage): Promise<void> {
  const { id, method, params = {} } = msg;
  
  const sendResponse = (result: any, error?: { code: number; message: string }) => {
    const response: WSMessage = {
      type: error ? 'error' : 'response',
      id,
      result,
      error,
    };
    send(ws, response);
  };
  
  switch (method) {
    // System
    case 'System.getInfo':
      return rpc.getSystemInfo().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'System.getStats':
      return rpc.getSystemStats().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Storage
    case 'Storage.getDisks':
      return rpc.getDisks().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Storage.getMountPoints':
      return rpc.getMountPoints().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Services
    case 'Service.getAll':
      return rpc.getServices().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Service.setEnabled':
      return rpc.setServiceEnabled(params.name as string, params.enabled as boolean)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Service.setRunning':
      return rpc.setServiceRunning(params.name as string, params.running as boolean)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Shares
    case 'Share.getAll':
      return rpc.getShares().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Share.create':
      return rpc.createShare(params as unknown as ShareInput)
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Share.update':
      return rpc.updateShare(params.uuid as string, params as unknown as ShareInput)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Share.delete':
      return rpc.deleteShare(params.uuid as string)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Network
    case 'Network.getInterfaces':
      return rpc.getNetworkInterfaces().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Network.setInterface':
      return rpc.setNetworkInterface(params as unknown as NetworkConfig)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Users
    case 'User.getAll':
      return rpc.getUsers().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'User.create':
      return rpc.createUser(params as unknown as UserInput)
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'User.update':
      return rpc.updateUser(params.username as string, params as unknown as UserInput)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'User.delete':
      return rpc.deleteUser(params.username as string)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Groups
    case 'Group.getAll':
      return rpc.getGroups().then(sendResponse).catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Group.create':
      return rpc.createGroup(params as unknown as GroupInput)
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Group.update':
      return rpc.updateGroup(params.groupname as string, params as unknown as GroupInput)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Group.delete':
      return rpc.deleteGroup(params.groupname as string)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Power
    case 'System.reboot':
      return rpc.reboot()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'System.shutdown':
      return rpc.shutdown()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Cron Jobs
    case 'Cron.getJobs':
      return rpc.getCronJobs()
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Cron.setJob':
      return rpc.setCronJob(params)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Cron.deleteJob':
      return rpc.deleteCronJob(params.uuid as string)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Rsync Jobs
    case 'Rsync.getJobs':
      return rpc.getRsyncJobs()
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Rsync.setJob':
      return rpc.setRsyncJob(params)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Rsync.deleteJob':
      return rpc.deleteRsyncJob(params.uuid as string)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Rsync.runJob':
      return rpc.runRsyncJob(params.uuid as string)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // SMART Monitoring
    case 'Smart.getDevices':
      return rpc.getSmartDevices()
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Smart.getData':
      return rpc.getSmartData(params.device as string)
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Smart.getSettings':
      return rpc.getSmartSettings()
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Smart.setSettings':
      return rpc.setSmartSettings(params)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Notifications
    case 'Notification.getList':
      return rpc.getNotifications()
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Notification.send':
      return rpc.sendNotification(params.title as string, params.message as string)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // RRD Statistics
    case 'RRD.getGraph':
      return rpc.getRRDData(params.period as string || 'day')
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // APT/Package Management
    case 'Apt.getSettings':
      return rpc.getSoftwareSettings()
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Apt.setSettings':
      return rpc.setSoftwareSettings(params)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Apt.update':
      return rpc.updatePackages()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Apt.upgrade':
      return rpc.upgradePackages()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Config Management
    case 'Config.get':
      return rpc.getConfig(params.section as string)
        .then(result => sendResponse(result))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Config.set':
      return rpc.setConfig(params.section as string, params.config)
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Config.apply':
      return rpc.applyConfig()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    
    // Auth
    case 'Session.login':
      return rpc.login(params.username as string, params.password as string)
        .then(sid => sendResponse({ sid }))
        .catch(e => sendResponse(null, { code: -1, message: e.message }));
    case 'Session.logout':
      return rpc.logout().then(() => sendResponse({ success: true }));
    
    default:
      sendResponse(null, { code: -32601, message: `Method not found: ${method}` });
  }
  
  return Promise.resolve();
}

export function handleWS(ws: WSConnection) {
  const handler = (msg: WSMessage) => send(ws, msg);
  
  addClient(handler);
  
  ws.onmessage = async (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data) as WSMessage;
      
      if (msg.type === 'request' && msg.method) {
        await handleMessage(ws, msg);
      }
    } catch (e) {
      const errorMsg: WSMessage = {
        type: 'error',
        id: crypto.randomUUID(),
        error: { code: -32700, message: 'Parse error' },
      };
      send(ws, errorMsg);
    }
  };
  
  ws.onclose = () => {
    removeClient(handler);
  };
  
  ws.onerror = () => {
    removeClient(handler);
  };
}
