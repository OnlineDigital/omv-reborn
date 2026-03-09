// Notifications Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api, notifications } from '../stores/system';

export function Notifications() {
  const [loading, setLoading] = createSignal(false);
  const [showModal, setShowModal] = createSignal(false);
  const [filter, setFilter] = createSignal<'all' | 'info' | 'warning' | 'error'>('all');

  const [formData, setFormData] = createSignal({
    title: '',
    message: '',
  });

  onMount(() => {
    api.getNotifications();
  });

  const sendNotification = async () => {
    setLoading(true);
    try {
      await api.sendNotification(formData().title, formData().message);
      setShowModal(false);
      setFormData({ title: '', message: '' });
      api.getNotifications();
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = () => {
    const n = notifications();
    if (filter() === 'all') return n;
    return n.filter((notif: any) => {
      if (filter() === 'error') return notif.type === 'error';
      if (filter() === 'warning') return notif.type === 'warning';
      if (filter() === 'info') return notif.type === 'info';
      return true;
    });
  };

  const getTypeIcon = (type?: string) => {
    if (type === 'error') return '❌';
    if (type === 'warning') return '⚠️';
    if (type === 'success') return '✅';
    return 'ℹ️';
  };

  const getTypeColor = (type?: string) => {
    if (type === 'error') return 'text-red-400 border-red-800';
    if (type === 'warning') return 'text-yellow-400 border-yellow-800';
    if (type === 'success') return 'text-green-400 border-green-800';
    return 'text-blue-400 border-blue-800';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Notifications</h1>
        <Button onClick={() => setShowModal(true)}>+ Send Notification</Button>
      </div>

      {/* Filters */}
      <div class="flex gap-2">
        <For each={['all', 'info', 'warning', 'error'] as const}>
          {(f) => (
            <button
              class={`px-3 py-1 rounded text-sm ${filter() === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )}
        </For>
      </div>

      <Show
        when={filteredNotifications().length > 0}
        fallback={
          <Card>
            <p class="text-gray-400 text-center py-8">No notifications</p>
          </Card>
        }
      >
        <div class="space-y-3">
          <For each={filteredNotifications()}>
            {(notif: any) => (
              <Card>
                <div class={`border-l-4 ${getTypeColor(notif.type)} pl-4`}>
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <span>{getTypeIcon(notif.type)}</span>
                        <h3 class="font-semibold">{notif.title}</h3>
                      </div>
                      <p class="text-gray-400 text-sm mt-1">{notif.message}</p>
                      <p class="text-gray-500 text-xs mt-2">{formatDate(notif.timestamp || notif.date)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </For>
        </div>
      </Show>

      <Show when={showModal()}>
        <Modal title="Send Notification" onClose={() => setShowModal(false)}>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                value={formData().title}
                onInput={(e) => setFormData({ ...formData(), title: e.currentTarget.value })}
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Message</label>
              <textarea
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-24"
                value={formData().message}
                onInput={(e) => setFormData({ ...formData(), message: e.currentTarget.value })}
              />
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button loading={loading()} onClick={sendNotification}>Send</Button>
            </div>
          </div>
        </Modal>
      </Show>
    </div>
  );
}
