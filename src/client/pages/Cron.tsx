// Cron Jobs Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api, cronJobs } from '../stores/system';

export function Cron() {
  const [loading, setLoading] = createSignal(false);
  const [showModal, setShowModal] = createSignal(false);
  const [editingJob, setEditingJob] = createSignal<any>(null);
  const [formData, setFormData] = createSignal({
    uuid: '',
    enable: true,
    minute: '*',
    hour: '*',
    dayofmonth: '*',
    month: '*',
    dayofweek: '*',
    command: '',
    comment: '',
  });

  onMount(() => {
    api.getCronJobs();
  });

  const openModal = (job?: any) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        uuid: job.uuid || '',
        enable: job.enable ?? true,
        minute: job.minute || '*',
        hour: job.hour || '*',
        dayofmonth: job.dayofmonth || '*',
        month: job.month || '*',
        dayofweek: job.dayofweek || '*',
        command: job.command || '',
        comment: job.comment || '',
      });
    } else {
      setEditingJob(null);
      setFormData({
        uuid: '',
        enable: true,
        minute: '*',
        hour: '*',
        dayofmonth: '*',
        month: '*',
        dayofweek: '*',
        command: '',
        comment: '',
      });
    }
    setShowModal(true);
  };

  const saveJob = async () => {
    setLoading(true);
    try {
      await api.setCronJob(formData());
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (uuid: string) => {
    if (!confirm('Delete this cron job?')) return;
    setLoading(true);
    try {
      await api.deleteCronJob(uuid);
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (job: any) => {
    const m = job.minute || '*';
    const h = job.hour || '*';
    const dom = job.dayofmonth || '*';
    const mon = job.month || '*';
    const dow = job.dayofweek || '*';
    return `${m} ${h} ${dom} ${mon} ${dow}`;
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Cron Jobs</h1>
        <Button onClick={() => openModal()}>+ Add Job</Button>
      </div>

      <Show
        when={cronJobs().length > 0}
        fallback={
          <Card>
            <p class="text-gray-400 text-center py-8">No cron jobs configured</p>
          </Card>
        }
      >
        <div class="grid gap-4">
          <For each={cronJobs()}>
            {(job) => (
              <Card>
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <span class={`w-2 h-2 rounded-full ${job.enable ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <h3 class="font-semibold">{job.comment || job.uuid?.slice(0, 8) || 'Unnamed Job'}</h3>
                    </div>
                    <p class="text-gray-400 text-sm mt-1 font-mono">{formatSchedule(job)}</p>
                    <p class="text-gray-500 text-xs mt-1 font-mono truncate">{job.command}</p>
                  </div>
                  <div class="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openModal(job)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteJob(job.uuid)}>Delete</Button>
                  </div>
                </div>
              </Card>
            )}
          </For>
        </div>
      </Show>

      <Show when={showModal()}>
        <Modal title={editingJob() ? 'Edit Cron Job' : 'Add Cron Job'} onClose={() => setShowModal(false)}>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Comment</label>
              <input
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                value={formData().comment}
                onInput={(e) => setFormData({ ...formData(), comment: e.currentTarget.value })}
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Command</label>
              <input
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono"
                value={formData().command}
                onInput={(e) => setFormData({ ...formData(), command: e.currentTarget.value })}
              />
            </div>
            <div class="grid grid-cols-5 gap-2">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Minute</label>
                <input
                  type="text"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-center"
                  value={formData().minute}
                  onInput={(e) => setFormData({ ...formData(), minute: e.currentTarget.value })}
                />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Hour</label>
                <input
                  type="text"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-center"
                  value={formData().hour}
                  onInput={(e) => setFormData({ ...formData(), hour: e.currentTarget.value })}
                />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Day</label>
                <input
                  type="text"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-center"
                  value={formData().dayofmonth}
                  onInput={(e) => setFormData({ ...formData(), dayofmonth: e.currentTarget.value })}
                />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Month</label>
                <input
                  type="text"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-center"
                  value={formData().month}
                  onInput={(e) => setFormData({ ...formData(), month: e.currentTarget.value })}
                />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1">Weekday</label>
                <input
                  type="text"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-center"
                  value={formData().dayofweek}
                  onInput={(e) => setFormData({ ...formData(), dayofweek: e.currentTarget.value })}
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable"
                checked={formData().enable}
                onChange={(e) => setFormData({ ...formData(), enable: e.currentTarget.checked })}
              />
              <label for="enable" class="text-sm text-gray-300">Enabled</label>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button loading={loading()} onClick={saveJob}>Save</Button>
            </div>
          </div>
        </Modal>
      </Show>
    </div>
  );
}
