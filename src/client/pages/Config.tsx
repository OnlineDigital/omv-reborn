// Configuration Management Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api, configData } from '../stores/system';

export function Config() {
  const [loading, setLoading] = createSignal(false);
  const [showModal, setShowModal] = createSignal(false);
  const [selectedSection, setSelectedSection] = createSignal<string | null>(null);
  const [rawConfig, setRawConfig] = createSignal('{}');
  const [applying, setApplying] = createSignal(false);

  const sections = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'date', name: 'Date & Time', icon: '🕐' },
    { id: 'network', name: 'Network', icon: '🌐' },
    { id: 'firewall', name: 'Firewall', icon: '🛡️' },
    { id: 'logging', name: 'Logging', icon: '📝' },
    { id: 'storage', name: 'Storage', icon: '💾' },
    { id: 'raid', name: 'RAID', icon: '🔢' },
    { id: 'quotas', name: 'Quotas', icon: '📊' },
  ];

  onMount(() => {
    // Load default section
    loadSection('general');
  });

  const loadSection = async (section: string) => {
    setLoading(true);
    setSelectedSection(section);
    try {
      const data = await api.getConfig(section);
      setRawConfig(JSON.stringify(data, null, 2));
    } catch (e) {
      setRawConfig('{}');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const config = JSON.parse(rawConfig());
      await api.setConfig(selectedSection()!, config);
      setShowModal(false);
      alert('Configuration saved');
    } catch (e) {
      alert('Invalid JSON');
    } finally {
      setLoading(false);
    }
  };

  const applyChanges = async () => {
    if (!confirm('Apply configuration changes? This may restart some services.')) return;
    setApplying(true);
    try {
      await api.applyConfig();
      alert('Configuration applied successfully');
    } catch (e) {
      alert('Failed to apply configuration');
    } finally {
      setApplying(false);
    }
  };

  const exportConfig = () => {
    const config = {
      general: { hostname: 'omv', domain: 'local' },
      date: { timezone: 'Europe/Bucharest', ntp: true },
      network: { interfaces: ['eth0'] },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omv-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          JSON.parse(text);
          setRawConfig(text);
          setShowModal(true);
        } catch {
          alert('Invalid JSON file');
        }
      }
    };
    input.click();
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Configuration</h1>
        <div class="flex gap-2">
          <Button variant="secondary" onClick={exportConfig}>Export</Button>
          <Button variant="secondary" onClick={importConfig}>Import</Button>
          <Button variant="primary" loading={applying()} onClick={applyChanges}>Apply Changes</Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div class="space-y-2">
          <For each={sections}>
            {(section) => (
              <button
                class={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-colors ${
                  selectedSection() === section.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => loadSection(section.id)}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </button>
            )}
          </For>
        </div>

        {/* Config Editor */}
        <div class="md:col-span-3">
          <Card>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">
                {sections.find(s => s.id === selectedSection())?.name || 'Configuration'}
              </h2>
              <Button size="sm" onClick={() => setShowModal(true)}>Edit Raw JSON</Button>
            </div>

            <Show when={!loading()} fallback={<p class="text-gray-400 text-center py-8">Loading...</p>}>
              <div class="bg-gray-900 rounded p-4 font-mono text-sm overflow-auto max-h-[500px]">
                <pre class="text-gray-300 whitespace-pre-wrap">{rawConfig()}</pre>
              </div>
            </Show>
          </Card>

          {/* Quick Settings */}
          <Card class="mt-6">
            <h2 class="text-lg font-semibold mb-4">Quick Settings</h2>
            <div class="space-y-4">
              <Show when={selectedSection() === 'general'}>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Hostname</label>
                    <input type="text" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value="omv" />
                  </div>
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Domain</label>
                    <input type="text" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value="local" />
                  </div>
                </div>
              </Show>
              <Show when={selectedSection() === 'date'}>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">Timezone</label>
                    <select class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                      <option>Europe/Bucharest</option>
                      <option>America/New_York</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-400 mb-1">NTP Server</label>
                    <input type="text" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white" value="pool.ntp.org" />
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="ntp" checked />
                  <label for="ntp" class="text-sm text-gray-300">Enable NTP</label>
                </div>
              </Show>
              <Show when={selectedSection() === 'logging'}>
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-2">
                    <div>
                      <h3 class="font-medium">System Log</h3>
                      <p class="text-gray-400 text-sm">Enable system logging</p>
                    </div>
                    <button class="w-12 h-6 bg-green-600 rounded-full">
                      <span class="block w-5 h-5 bg-white rounded-full translate-x-6" />
                    </button>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <div>
                      <h3 class="font-medium">Log Rotation</h3>
                      <p class="text-gray-400 text-sm">Rotate logs when they exceed 100MB</p>
                    </div>
                    <button class="w-12 h-6 bg-green-600 rounded-full">
                      <span class="block w-5 h-5 bg-white rounded-full translate-x-6" />
                    </button>
                  </div>
                </div>
              </Show>
              <Show when={!['general', 'date', 'logging'].includes(selectedSection() || '')}>
                <p class="text-gray-400 text-center py-4">Select a section to view settings</p>
              </Show>
            </div>
          </Card>
        </div>
      </div>

      {/* Raw JSON Edit Modal */}
      <Show when={showModal()}>
        <Modal title="Edit Configuration (JSON)" onClose={() => setShowModal(false)}>
          <div class="space-y-4">
            <div>
              <textarea
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono h-96"
                value={rawConfig()}
                onInput={(e) => setRawConfig(e.currentTarget.value)}
              />
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button loading={loading()} onClick={saveConfig}>Save</Button>
            </div>
          </div>
        </Modal>
      </Show>
    </div>
  );
}
