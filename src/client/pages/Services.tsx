// Services Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api, services } from '../stores/system';
import type { Service } from '../../shared/types';

export function Services() {
  const [loading, setLoading] = createSignal<string | null>(null);
  
  onMount(() => {
    api.getServices();
  });
  
  const toggleService = async (service: Service, action: 'enable' | 'running') => {
    const key = `${service.name}-${action}`;
    setLoading(key);
    try {
      if (action === 'enable') {
        await api.setServiceEnabled(service.name, !service.enable);
      } else {
        await api.setServiceRunning(service.name, !service.running);
      }
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Services</h1>
      
      <div class="grid gap-4">
        <Show 
          when={services().length > 0}
          fallback={<p class="text-gray-400">No services found</p>}
        >
          <For each={services()}>
            {(service) => (
              <Card>
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold">{service.title}</h3>
                    <p class="text-gray-400 text-sm">{service.name}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <span class={`w-2 h-2 rounded-full ${service.running ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span class={service.running ? 'text-green-400' : 'text-gray-400'}>
                        {service.running ? 'Running' : 'Stopped'}
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <Button
                        size="sm"
                        variant={service.running ? 'danger' : 'success'}
                        loading={loading(`${service.name}-running`)}
                        onClick={() => toggleService(service, 'running')}
                      >
                        {service.running ? 'Stop' : 'Start'}
                      </Button>
                      <Button
                        size="sm"
                        variant={service.enable ? 'primary' : 'secondary'}
                        loading={loading(`${service.name}-enable`)}
                        onClick={() => toggleService(service, 'enable')}
                      >
                        {service.enable ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}
