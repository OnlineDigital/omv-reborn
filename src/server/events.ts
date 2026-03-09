// Event emitters for pushing system stats to WebSocket clients
import { getSystemStats } from './rpc-client.ts';
import type { SystemStats, WSMessage } from '../shared/types.ts';

type WSHandler = (msg: WSMessage) => void;
const clients: Set<WSHandler> = new Set();
let intervalId: number | null = null;

export function addClient(handler: WSHandler) {
  clients.add(handler);
  
  if (clients.size === 1) {
    startPolling();
  }
}

export function removeClient(handler: WSHandler) {
  clients.delete(handler);
  
  if (clients.size === 0) {
    stopPolling();
  }
}

function startPolling() {
  if (intervalId) return;
  
  intervalId = setInterval(async () => {
    try {
      const stats = await getSystemStats();
      broadcastEvent('system:stats', stats);
    } catch (e) {
      // Silently ignore errors during polling
    }
  }, 5000) as unknown as number;
}

function stopPolling() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function broadcastEvent(event: string, data: any) {
  const msg: WSMessage = {
    type: 'event',
    id: crypto.randomUUID(),
    event,
    data,
  };
  
  for (const client of clients) {
    try {
      client(msg);
    } catch (e) {
      // Remove broken clients
      clients.delete(client);
    }
  }
}

export function broadcastProgress(id: string, progress: number) {
  const msg: WSMessage = {
    type: 'event',
    id,
    event: 'task:progress',
    progress,
  };
  
  for (const client of clients) {
    try {
      client(msg);
    } catch (e) {
      clients.delete(client);
    }
  }
}
