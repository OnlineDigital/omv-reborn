// Package Management Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api, aptSettings } from '../stores/system';

export function Packages() {
  const [loading, setLoading] = createSignal(false);
  const [actionLoading, setActionLoading] = createSignal<string | null>(null);
  const [updates, setUpdates] = createSignal<any[]>([]);
  const [upgrading, setUpgrading] = createSignal(false);

  onMount(() => {
    api.getAptSettings();
    // Mock available updates for demo
    setUpdates([
      { package: 'openssl', current: '3.0.15', available: '3.0.16', type: 'security' },
      { package: 'nginx', current: '1.24.0', available: '1.25.0', type: 'normal' },
      { package: 'docker-ce', current: '25.0.0', available: '25.0.1', type: 'normal' },
      { package: 'postgresql', current: '15.2', available: '15.3', type: 'normal' },
    ]);
  });

  const checkForUpdates = async () => {
    setActionLoading('update');
    try {
      await api.updatePackages();
      // In real implementation, would get list of available updates
    } finally {
      setActionLoading(null);
    }
  };

  const upgradeAll = async () => {
    if (!confirm('Upgrade all packages? This may take a while.')) return;
    setUpgrading(true);
    setActionLoading('upgrade');
    try {
      await api.upgradePackages();
      setUpdates([]);
      alert('Upgrade complete!');
    } catch (e) {
      alert('Upgrade failed');
    } finally {
      setUpgrading(false);
      setActionLoading(null);
    }
  };

  const upgradeSingle = async (pkg: string) => {
    if (!confirm(`Upgrade ${pkg}?`)) return;
    setActionLoading(`upgrade-${pkg}`);
    try {
      // In real implementation, would upgrade single package
      setUpdates(updates().filter(u => u.package !== pkg));
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeColor = (type: string) => {
    if (type === 'security') return 'bg-red-900 text-red-300';
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Package Management</h1>
        <div class="flex gap-2">
          <Button 
            variant="secondary" 
            loading={actionLoading() === 'update'}
            onClick={checkForUpdates}
          >
            Check for Updates
          </Button>
          <Button 
            variant="success" 
            loading={actionLoading() === 'upgrade'}
            disabled={updates().length === 0}
            onClick={upgradeAll}
          >
            Upgrade All ({updates().length})
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <h3 class="text-gray-400 text-sm">Last Checked</h3>
          <p class="text-lg font-semibold">{new Date().toLocaleString()}</p>
        </Card>
        <Card>
          <h3 class="text-gray-400 text-sm">Available Updates</h3>
          <p class="text-lg font-semibold text-yellow-400">{updates().length}</p>
        </Card>
        <Card>
          <h3 class="text-gray-400 text-sm">Security Updates</h3>
          <p class="text-lg font-semibold text-red-400">
            {updates().filter(u => u.type === 'security').length}
          </p>
        </Card>
        <Card>
          <h3 class="text-gray-400 text-sm">Auto Update</h3>
          <p class="text-lg font-semibold">
            {aptSettings()?.autoupdate ? 'Enabled' : 'Disabled'}
          </p>
        </Card>
      </div>

      {/* Available Updates */}
      <Card>
        <h2 class="text-lg font-semibold mb-4">Available Updates</h2>
        <Show
          when={updates().length > 0}
          fallback={
            <p class="text-gray-400 text-center py-8">
              System is up to date ✓
            </p>
          }
        >
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-gray-400 border-b border-gray-700">
                  <th class="text-left py-3 px-4">Package</th>
                  <th class="text-left py-3 px-4">Current Version</th>
                  <th class="text-left py-3 px-4">Available</th>
                  <th class="text-left py-3 px-4">Type</th>
                  <th class="text-right py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                <For each={updates()}>
                  {(update) => (
                    <tr class="border-b border-gray-800 hover:bg-gray-800/50">
                      <td class="py-3 px-4 font-mono">{update.package}</td>
                      <td class="py-3 px-4 text-gray-400">{update.current}</td>
                      <td class="py-3 px-4 text-green-400 font-mono">{update.available}</td>
                      <td class="py-3 px-4">
                        <span class={`text-xs px-2 py-1 rounded ${getTypeColor(update.type)}`}>
                          {update.type}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          loading={actionLoading() === `upgrade-${update.package}`}
                          onClick={() => upgradeSingle(update.package)}
                        >
                          Upgrade
                        </Button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Card>

      {/* Settings */}
      <Card>
        <h2 class="text-lg font-semibold mb-4">Update Settings</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-2">
            <div>
              <h3 class="font-medium">Automatic Updates</h3>
              <p class="text-gray-400 text-sm">Automatically download and install security updates</p>
            </div>
            <button
              class={`w-12 h-6 rounded-full transition-colors ${aptSettings()?.autoupdate ? 'bg-green-600' : 'bg-gray-700'}`}
              onClick={async () => {
                await api.setAptSettings({ autoupdate: !aptSettings()?.autoupdate });
                api.getAptSettings();
              }}
            >
              <span class={`block w-5 h-5 bg-white rounded-full transition-transform ${aptSettings()?.autoupdate ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div class="flex items-center justify-between py-2">
            <div>
              <h3 class="font-medium">Notify About Updates</h3>
              <p class="text-gray-400 text-sm">Send notification when updates are available</p>
            </div>
            <button
              class={`w-12 h-6 rounded-full transition-colors ${aptSettings()?.notify ? 'bg-green-600' : 'bg-gray-700'}`}
              onClick={async () => {
                await api.setAptSettings({ notify: !aptSettings()?.notify });
                api.getAptSettings();
              }}
            >
              <span class={`block w-5 h-5 bg-white rounded-full transition-transform ${aptSettings()?.notify ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
