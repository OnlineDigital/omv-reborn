// Network Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api, interfaces } from '../stores/system';
import type { NetworkInterface, NetworkConfig } from '../../shared/types';

export function Network() {
  const [loading, setLoading] = createSignal(false);
  const [configOpen, setConfigOpen] = createSignal(false);
  const [selectedIface, setSelectedIface] = createSignal<NetworkInterface | null>(null);
  
  // Form state
  const [method, setMethod] = createSignal<'dhcp' | 'manual'>('manual');
  const [address, setAddress] = createSignal('');
  const [netmask, setNetmask] = createSignal('');
  const [gateway, setGateway] = createSignal('');
  const [dns, setDns] = createSignal('');
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  
  onMount(() => {
    api.getInterfaces();
  });
  
  const columns = [
    { key: 'iface', header: 'Interface' },
    { key: 'method', header: 'Method' },
    { key: 'address', header: 'Address' },
    { key: 'netmask', header: 'Netmask' },
    { key: 'gateway', header: 'Gateway' },
    { key: 'macaddress', header: 'MAC Address' },
    { 
      key: 'dns',
      header: 'DNS',
      render: (i: NetworkInterface) => i.dns?.join(', ') || '-'
    },
    { 
      key: 'flags', 
      header: 'Status',
      render: (i: NetworkInterface) => (
        <span class={i.flags?.includes('UP') ? 'text-green-400' : 'text-gray-400'}>
          {i.flags?.join(', ') || 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (i: NetworkInterface) => (
        <Button size="sm" variant="secondary" onClick={() => openConfig(i)}>
          Configure
        </Button>
      )
    },
  ];
  
  const openConfig = (iface: NetworkInterface) => {
    setSelectedIface(iface);
    setMethod(iface.method === 'dhcp' ? 'dhcp' : 'manual');
    setAddress(iface.address || '');
    setNetmask(iface.netmask || '');
    setGateway(iface.gateway || '');
    setDns(iface.dns?.join('\n') || '');
    setErrors({});
    setConfigOpen(true);
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (method() === 'manual') {
      if (!address().trim()) {
        newErrors.address = 'IP address is required';
      } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(address())) {
        newErrors.address = 'Invalid IP address';
      }
      
      if (!netmask().trim()) {
        newErrors.netmask = 'Netmask is required';
      } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(netmask())) {
        newErrors.netmask = 'Invalid netmask';
      }
    }
    
    if (dns().trim()) {
      const dnsList = dns().split('\n').map(d => d.trim()).filter(d => d);
      for (const d of dnsList) {
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(d)) {
          newErrors.dns = 'Invalid DNS server address';
          break;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validate()) return;
    if (!selectedIface()) return;
    
    setLoading(true);
    try {
      const config: NetworkConfig = {
        iface: selectedIface()!.iface,
        method: method(),
        address: method() === 'manual' ? address().trim() : undefined,
        netmask: method() === 'manual' ? netmask().trim() : undefined,
        gateway: method() === 'manual' && gateway().trim() ? gateway().trim() : undefined,
        dns: dns().trim() ? dns().split('\n').map(d => d.trim()).filter(d => d) : undefined,
      };
      
      await api.setInterface(config);
      setConfigOpen(false);
    } catch (err) {
      console.error('Failed to save network config:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Network</h1>
      
      <Card title="Interfaces">
        <Show 
          when={interfaces().length > 0}
          fallback={<p class="text-gray-400">No interfaces found</p>}
        >
          <Table columns={columns} data={interfaces()} keyField="iface" />
        </Show>
      </Card>
      
      <Modal
        open={configOpen()}
        title={`Configure ${selectedIface()?.iface || 'Interface'}`}
        onClose={() => setConfigOpen(false)}
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Method</label>
            <select
              value={method()}
              onChange={(e) => setMethod(e.target.value as 'dhcp' | 'manual')}
              class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="dhcp">DHCP (Automatic)</option>
              <option value="manual">Static IP (Manual)</option>
            </select>
          </div>
          
          <Show when={method() === 'manual'}>
            <div>
              <label class="block text-sm text-gray-400 mb-1">IP Address</label>
              <input
                type="text"
                value={address()}
                onInput={(e) => setAddress(e.target.value)}
                class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="192.168.1.100"
              />
              <Show when={errors().address}>
                <p class="text-red-400 text-sm mt-1">{errors().address}</p>
              </Show>
            </div>
            
            <div>
              <label class="block text-sm text-gray-400 mb-1">Netmask</label>
              <input
                type="text"
                value={netmask()}
                onInput={(e) => setNetmask(e.target.value)}
                class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="255.255.255.0"
              />
              <Show when={errors().netmask}>
                <p class="text-red-400 text-sm mt-1">{errors().netmask}</p>
              </Show>
            </div>
            
            <div>
              <label class="block text-sm text-gray-400 mb-1">Gateway (optional)</label>
              <input
                type="text"
                value={gateway()}
                onInput={(e) => setGateway(e.target.value)}
                class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="192.168.1.1"
              />
            </div>
          </Show>
          
          <div>
            <label class="block text-sm text-gray-400 mb-1">
              DNS Servers {method() === 'dhcp' && <span class="text-gray-500">(used with DHCP)</span>}
            </label>
            <textarea
              value={dns()}
              onInput={(e) => setDns(e.target.value)}
              class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none h-20 resize-none"
              placeholder="8.8.8.8&#10;8.8.4.4"
            />
            <p class="text-gray-500 text-xs mt-1">One DNS server per line</p>
            <Show when={errors().dns}>
              <p class="text-red-400 text-sm mt-1">{errors().dns}</p>
            </Show>
          </div>
          
          <div class="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
