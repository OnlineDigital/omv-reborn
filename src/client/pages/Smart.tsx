// SMART Monitoring Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { api, smartDevices, smartData } from '../stores/system';

export function Smart() {
  const [loading, setLoading] = createSignal(false);
  const [selectedDevice, setSelectedDevice] = createSignal<string | null>(null);

  onMount(() => {
    api.getSmartDevices();
  });

  const selectDevice = async (device: string) => {
    setSelectedDevice(device);
    setLoading(true);
    try {
      await api.getSmartData(device);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (health: string) => {
    if (health === 'PASSED' || health === 'OK') return 'text-green-400';
    if (health === 'FAILED') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getAttributeColor = (id: number, value: number, worst: number, threshold: number) => {
    if (value <= threshold) return 'text-red-400';
    if (value <= threshold * 1.5) return 'text-yellow-400';
    return 'text-gray-300';
  };

  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">SMART Monitoring</h1>

      <Show
        when={smartDevices().length > 0}
        fallback={
          <Card>
            <p class="text-gray-400 text-center py-8">No SMART devices found</p>
          </Card>
        }
      >
        <div class="grid gap-4">
          {/* Device List */}
          <For each={smartDevices()}>
            {(device) => (
              <Card>
                <div 
                  class="cursor-pointer"
                  onClick={() => selectDevice(device.device || device.devname)}
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-semibold">{device.device || device.devname}</h3>
                      <p class="text-gray-400 text-sm">{device.model || device.name || 'Unknown'}</p>
                      <p class="text-gray-500 text-xs">{device.serial || device.serialnumber || ''}</p>
                    </div>
                    <div class="text-right">
                      <span class={`text-lg font-bold ${getStatusColor(device.health || device.smartstatus)}`}>
                        {device.health || device.smartstatus || 'Unknown'}
                      </span>
                      {selectedDevice() === (device.device || device.devname) && (
                        <p class="text-xs text-gray-500">Selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </For>
        </div>

        {/* SMART Data */}
        <Show when={selectedDevice() && smartData()}>
          <div class="mt-6">
            <h2 class="text-xl font-semibold mb-4">SMART Attributes</h2>
            <Card>
              <Show when={!loading()} fallback={<p class="text-gray-400 text-center py-4">Loading...</p>}>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="text-gray-400 border-b border-gray-700">
                        <th class="text-left py-2 px-2">ID</th>
                        <th class="text-left py-2 px-2">Attribute</th>
                        <th class="text-right py-2 px-2">Value</th>
                        <th class="text-right py-2 px-2">Worst</th>
                        <th class="text-right py-2 px-2">Threshold</th>
                        <th class="text-right py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={smartData().response?.data || smartData().data || []}>
                        {(attr: any) => (
                          <tr class="border-b border-gray-800 hover:bg-gray-800/50">
                            <td class="py-2 px-2 text-gray-500">{attr.id}</td>
                            <td class="py-2 px-2 font-mono text-gray-300">{attr.name || attr.attribute}</td>
                            <td class={`py-2 px-2 text-right font-mono ${getAttributeColor(attr.id, attr.value, attr.worst, attr.threshold)}`}>
                              {attr.value}
                            </td>
                            <td class="py-2 px-2 text-right text-gray-500 font-mono">{attr.worst}</td>
                            <td class="py-2 px-2 text-right text-gray-500 font-mono">{attr.threshold}</td>
                            <td class="py-2 px-2 text-right">
                              <Show when={attr.prefailure}>
                                <span class="text-xs bg-red-900 px-2 py-1 rounded">Pre-failure</span>
                              </Show>
                              <Show when={!attr.prefailure && attr.value <= attr.threshold}>
                                <span class="text-xs bg-yellow-900 px-2 py-1 rounded">Warning</span>
                              </Show>
                              <Show when={!attr.prefailure && attr.value > attr.threshold}>
                                <span class="text-xs bg-green-900 px-2 py-1 rounded">OK</span>
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </Show>
            </Card>
          </div>
        </Show>
      </Show>
    </div>
  );
}
