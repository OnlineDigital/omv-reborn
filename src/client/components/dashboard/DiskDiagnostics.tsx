// Disk Diagnostics Component
import { Component } from 'solid-js';
import { Icon } from '../Icon';
import { mockData, DiskInfo } from '../../stores/mockData';

const getStatusColor = (status: DiskInfo['status']) => {
  switch (status) {
    case 'passed':
      return 'text-emerald-500';
    case 'failed':
      return 'text-rose-500';
    case 'warning':
      return 'text-amber-500';
    default:
      return 'text-slate-500';
  }
};

export const DiskDiagnostics: Component = () => {
  const diskInfos = mockData.diskInfos;

  return (
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* IO Stats */}
      <div class="md:col-span-1 flex flex-col justify-center gap-4">
        <div class="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[10px] text-slate-500 uppercase">Current Read</span>
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          </div>
          <p class="text-2xl font-bold">
            128.4 <span class="text-sm font-normal text-slate-500">MB/s</span>
          </p>
        </div>
        <div class="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[10px] text-slate-500 uppercase">Current Write</span>
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </div>
          <p class="text-2xl font-bold">
            4.2 <span class="text-sm font-normal text-slate-500">MB/s</span>
          </p>
        </div>
      </div>

      {/* Disk List */}
      <div class="md:col-span-3">
        <div class="space-y-3">
          {diskInfos().map((disk) => (
            <div class="p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="font-mono text-indigo-400 font-medium">{disk.name}</span>
                <span class="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                  {disk.temperature}°C
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-400">
                  {disk.model} <span class="mx-1 text-slate-600">•</span> {disk.usage}% Usage
                </span>
                <span class={`text-[10px] font-bold tracking-wider uppercase ${getStatusColor(disk.status)}`}>
                  {disk.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
