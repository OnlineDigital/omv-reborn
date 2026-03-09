// Statistics / RRD Page
import { onMount, Show, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api, rrdData, stats } from '../stores/system';

export function Statistics() {
  const [loading, setLoading] = createSignal(false);
  const [period, setPeriod] = createSignal('day');

  onMount(() => {
    loadData();
  });

  const loadData = async () => {
    setLoading(true);
    try {
      await api.getRRDData(period());
    } finally {
      setLoading(false);
    }
  };

  const changePeriod = async (p: string) => {
    setPeriod(p);
    setLoading(true);
    try {
      await api.getRRDData(p);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data for demo (since RRD returns images/graphs)
  const generateMockData = () => {
    const points = 24;
    const data = [];
    for (let i = 0; i < points; i++) {
      data.push({
        time: `${i}:00`,
        cpu: Math.random() * 80 + 10,
        memory: Math.random() * 40 + 40,
        disk: Math.random() * 20 + 30,
      });
    }
    return data;
  };

  const chartData = () => rrdData().data || generateMockData();

  const maxValue = (key: string) => Math.max(...chartData().map((d: any) => d[key] || 0));

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">System Statistics</h1>
        <div class="flex gap-2">
          <For each={['hour', 'day', 'week', 'month', 'year'] as const}>
            {(p) => (
              <button
                class={`px-3 py-1 rounded text-sm ${period() === p ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                onClick={() => changePeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Current Stats Summary */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 class="text-gray-400 text-sm">CPU Usage</h3>
          <p class="text-3xl font-bold text-blue-400">{stats()?.cpu?.toFixed(1) || 0}%</p>
          <p class="text-gray-500 text-xs mt-1">Load: {stats()?.load?.join(', ') || '0, 0, 0'}</p>
        </Card>
        <Card>
          <h3 class="text-gray-400 text-sm">Memory Usage</h3>
          <p class="text-3xl font-bold text-purple-400">{stats()?.memory?.percent?.toFixed(1) || 0}%</p>
          <p class="text-gray-500 text-xs mt-1">
            {(stats()?.memory?.used / 1024 / 1024 / 1024 || 0).toFixed(1)} GB / {(stats()?.memory?.total / 1024 / 1024 / 1024 || 0).toFixed(1)} GB
          </p>
        </Card>
        <Card>
          <h3 class="text-gray-400 text-sm">Disk Usage</h3>
          <p class="text-3xl font-bold text-green-400">{stats()?.disk?.percent?.toFixed(1) || 0}%</p>
          <p class="text-gray-500 text-xs mt-1">
            {(stats()?.disk?.used / 1024 / 1024 / 1024 || 0).toFixed(1)} GB / {(stats()?.disk?.total / 1024 / 1024 / 1024 || 0).toFixed(1)} GB
          </p>
        </Card>
      </div>

      {/* CPU Chart */}
      <Card>
        <h2 class="text-lg font-semibold mb-4">CPU Usage Over Time</h2>
        <Show when={!loading()} fallback={<p class="text-gray-400 text-center py-8">Loading...</p>}>
          <div class="h-48 flex items-end gap-1">
            <For each={chartData()}>
              {(d: any) => (
                <div 
                  class="flex-1 bg-blue-600 rounded-t transition-all hover:bg-blue-500"
                  style={{ height: `${(d.cpu / 100) * 100}%` }}
                  title={`${d.time}: ${d.cpu?.toFixed(1)}%`}
                />
              )}
            </For>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </Show>
      </Card>

      {/* Memory Chart */}
      <Card>
        <h2 class="text-lg font-semibold mb-4">Memory Usage Over Time</h2>
        <Show when={!loading()} fallback={<p class="text-gray-400 text-center py-8">Loading...</p>}>
          <div class="h-48 flex items-end gap-1">
            <For each={chartData()}>
              {(d: any) => (
                <div 
                  class="flex-1 bg-purple-600 rounded-t transition-all hover:bg-purple-500"
                  style={{ height: `${(d.memory / 100) * 100}%` }}
                  title={`${d.time}: ${d.memory?.toFixed(1)}%`}
                />
              )}
            </For>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </Show>
      </Card>

      {/* Disk I/O Chart */}
      <Card>
        <h2 class="text-lg font-semibold mb-4">Disk Usage Over Time</h2>
        <Show when={!loading()} fallback={<p class="text-gray-400 text-center py-8">Loading...</p>}>
          <div class="h-48 flex items-end gap-1">
            <For each={chartData()}>
              {(d: any) => (
                <div 
                  class="flex-1 bg-green-600 rounded-t transition-all hover:bg-green-500"
                  style={{ height: `${(d.disk / 100) * 100}%` }}
                  title={`${d.time}: ${d.disk?.toFixed(1)}%`}
                />
              )}
            </For>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </Show>
      </Card>

      {/* Network Stats */}
      <Card>
        <h2 class="text-lg font-semibold mb-4">Network Statistics</h2>
        <Show when={!loading()} fallback={<p class="text-gray-400 text-center py-8">Loading...</p>}>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-800 rounded p-4">
              <h4 class="text-gray-400 text-sm">Bytes Received</h4>
              <p class="text-2xl font-bold text-cyan-400">1.2 GB</p>
            </div>
            <div class="bg-gray-800 rounded p-4">
              <h4 class="text-gray-400 text-sm">Bytes Sent</h4>
              <p class="text-2xl font-bold text-orange-400">856 MB</p>
            </div>
          </div>
        </Show>
      </Card>
    </div>
  );
}

import { For } from 'solid-js';
