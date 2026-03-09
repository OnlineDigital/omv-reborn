// Core Services Component with Toggle Switches
import { Component } from 'solid-js';
import { Icon } from '../Icon';
import { ToggleSwitch } from '../ToggleSwitch';
import { mockData } from '../../stores/mockData';

const getServiceStatusColor = (running: boolean) => {
  return running
    ? 'bg-emerald-500/10 text-emerald-500'
    : 'bg-slate-500/10 text-slate-500';
};

const getServiceText = (service: { running: boolean; connections?: number; port?: number; lastScan?: string }) => {
  if (service.running) {
    if (service.connections !== undefined) return `Running • ${service.connections} Connections`;
    if (service.port !== undefined) return `Running • Port ${service.port}`;
    if (service.lastScan !== undefined) return `Healthy • Scanned ${service.lastScan}`;
    return 'Running';
  }
  return 'Disabled';
};

export const CoreServices: Component = () => {
  const coreServices = mockData.coreServices;
  const toggleService = mockData.toggleService;

  return (
    <div class="space-y-4">
      {coreServices().map((service) => (
        <div class={`flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 ${!service.running ? 'opacity-60' : ''}`}>
          <div class="flex items-center gap-3">
            <div class={`p-2 rounded-lg ${getServiceStatusColor(service.running)}`}>
              <Icon name={service.icon} size={16} />
            </div>
            <div>
              <p class="text-sm font-medium">{service.name}</p>
              <p class="text-[10px] text-slate-500">
                {getServiceText(service)}
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={service.running}
            onChange={() => toggleService(service.id)}
          />
        </div>
      ))}
    </div>
  );
};
