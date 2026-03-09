// Storage Pools Component
import { Component } from 'solid-js';
import { mockData, StoragePool } from '../../stores/mockData';

const getStatusStyles = (status: StoragePool['status']) => {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'scrubbing':
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    case 'degraded':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'offline':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getProgressBarColor = (status: StoragePool['status']) => {
  switch (status) {
    case 'scrubbing':
      return 'bg-indigo-400';
    default:
      return 'bg-indigo-500';
  }
};

export const StoragePools: Component = () => {
  const storagePools = mockData.storagePools;
  const formatBytes = mockData.formatBytes;

  return (
    <div class="space-y-6">
      {storagePools().map((pool) => {
        const usedPercent = (pool.used / pool.total) * 100;

        return (
          <div>
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-3">
                <span class="font-mono text-sm">{pool.name}</span>
                <span class={`px-2 py-0.5 text-[10px] rounded border uppercase font-bold tracking-widest ${getStatusStyles(pool.status)}`}>
                  {pool.status}
                </span>
              </div>
              <span class="text-xs text-slate-400">
                {formatBytes(pool.used * 1024 * 1024 * 1024)} / {formatBytes(pool.total * 1024 * 1024 * 1024)}
              </span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div class={`h-full rounded-full ${getProgressBarColor(pool.status)} ${pool.status === 'scrubbing' ? 'animate-pulse' : ''}`} style={`width: ${usedPercent}%`}></div>
            </div>
            <div class="mt-2 flex justify-between text-[10px] text-slate-500 uppercase tracking-tighter">
              <span>{pool.raidType} | {pool.diskCount} Disks</span>
              <span class={pool.status === 'scrubbing' ? 'text-indigo-400 animate-pulse' : ''}>
                {pool.scrubProgress !== undefined ? `Scrub: ${pool.scrubProgress}% Complete` : 'Scrub: Not Run'}
                {pool.status === 'scrubbing' && '...'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
