// Dashboard Page - NAS-PRO Design
import { onMount, Show, createSignal, For } from 'solid-js';
import { api, connected, stats, systemInfo, services } from '../stores/system';
import { GlassCard } from '../components/GlassCard';
import { Icon } from '../components/Icon';
import { CpuChart, RamChart } from '../components/charts';
import { ActivityFeed, StoragePools, NetworkCard, DiskDiagnostics, CoreServices } from '../components/dashboard';

export function Dashboard() {
  const [loading, setLoading] = createSignal<string | null>(null);

  onMount(() => {
    api.getSystemInfo();
    api.getStats();
    api.getServices();
  });

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div class="space-y-6">
      {/* Welcome Section */}
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-200">System Dashboard</h1>
        <p class="text-slate-400">Overview of your storage performance and health.</p>
      </div>

      {/* Dashboard Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Resources Card */}
        <GlassCard
          title={
            <div class="flex items-center gap-2">
              <Icon name="cpu" size={20} class="text-indigo-400" />
              System Resources
            </div>
          }
          titleAction={
            <span class="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-md">
              Live Update
            </span>
          }
          class="lg:col-span-8 h-[400px] flex flex-col"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {/* CPU Chart */}
            <div class="md:col-span-2 flex flex-col">
              <div class="flex justify-between items-end mb-2">
                <span class="text-xs text-slate-500 font-mono">CPU Load (Average {stats()?.cpu?.toFixed(1) || 15}%)</span>
                <span class="text-xs text-indigo-400">Peak: 42%</span>
              </div>
              <CpuChart height="100%" />
            </div>

            {/* RAM Chart */}
            <div class="flex flex-col border-l border-slate-800/50 pl-6">
              <div class="flex justify-between items-end mb-2">
                <span class="text-xs text-slate-500 font-mono">
                  RAM Usage ({formatBytes(stats()?.memory?.used || 12.4 * 1024 * 1024 * 1024)})
                </span>
                <span class="text-xs text-indigo-400">Total: {formatBytes(stats()?.memory?.total || 32 * 1024 * 1024 * 1024)}</span>
              </div>
              <RamChart height="160px" />
              <div class="w-full space-y-2 mt-4">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-500">Free:</span>
                  <span class="text-slate-200">{formatBytes((stats()?.memory?.free || 0) || 19.6 * 1024 * 1024 * 1024)}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-500">Cached:</span>
                  <span class="text-slate-200">4.2 GB</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Recent Activity Card */}
        <GlassCard
          title={
            <div class="flex items-center gap-2">
              <Icon name="clock" size={20} class="text-indigo-400" />
              Recent Activity
            </div>
          }
          titleAction={
            <button class="text-xs text-slate-500 hover:text-indigo-400">Clear all</button>
          }
          class="lg:col-span-4 h-[400px] flex flex-col"
        >
          <ActivityFeed />
        </GlassCard>

        {/* ZFS Storage Pools Card */}
        <GlassCard
          title={
            <div class="flex items-center gap-2">
              <Icon name="database" size={20} class="text-indigo-400" />
              ZFS Storage Pools
            </div>
          }
          class="lg:col-span-7"
        >
          <StoragePools />
        </GlassCard>

        {/* Network Activity Card */}
        <GlassCard
          title={
            <div class="flex items-center gap-2">
              <Icon name="arrow-up-down" size={20} class="text-indigo-400" />
              Network Activity
            </div>
          }
          class="lg:col-span-5"
        >
          <NetworkCard />
        </GlassCard>

        {/* Disk Diagnostics & I/O Card */}
        <GlassCard
          title={
            <div class="flex items-center gap-2">
              <Icon name="hard-drive" size={20} class="text-indigo-400" />
              Disk Diagnostics & I/O
            </div>
          }
          titleAction={
            <div class="text-xs font-mono text-slate-500">
              Total Read: 24.5 GB | Total Write: 1.2 TB
            </div>
          }
          class="lg:col-span-8"
        >
          <DiskDiagnostics />
        </GlassCard>

        {/* Core Services Card */}
        <GlassCard
          title={
            <div class="flex items-center gap-2">
              <Icon name="activity" size={20} class="text-indigo-400" />
              Core Services
            </div>
          }
          class="lg:col-span-4 flex flex-col"
        >
          <CoreServices />
        </GlassCard>
      </div>
    </div>
  );
}
