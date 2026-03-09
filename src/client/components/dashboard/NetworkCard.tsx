// Network Activity Card Component
import { Component } from 'solid-js';
import { Icon } from '../Icon';
import { NetworkChart } from '../charts';
import { mockData } from '../../stores/mockData';

export const NetworkCard: Component = () => {
  const networkStats = mockData.networkStats;

  return (
    <div>
      <NetworkChart
        rxData={networkStats().rxHistory}
        txData={networkStats().txHistory}
        height="160px"
      />
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
          <p class="text-xs text-slate-500 mb-1">Inbound (RX)</p>
          <p class="text-xl font-bold text-indigo-400">
            {networkStats().rx.toFixed(1)} <span class="text-xs font-normal text-slate-400">Mb/s</span>
          </p>
        </div>
        <div class="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
          <p class="text-xs text-slate-500 mb-1">Outbound (TX)</p>
          <p class="text-xl font-bold text-rose-400">
            {networkStats().tx.toFixed(1)} <span class="text-xs font-normal text-slate-400">Mb/s</span>
          </p>
        </div>
      </div>
    </div>
  );
};
