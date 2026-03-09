// Rsync Jobs Page
import { onMount, Show, For, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api, rsyncJobs } from '../stores/system';

export function Rsync() {
  const [loading, setLoading] = createSignal<string | null>(null);
  const [showModal, setShowModal] = createSignal(false);
  const [editingJob, setEditingJob] = createSignal<any>(null);
  const [formData, setFormData] = createSignal({
    uuid: '',
    enable: true,
    source: '',
    destination: '',
    recursive: true,
    compress: true,
    preserve: true,
    delete: false,
    bwlimit: 0,
    comment: '',
  });

  onMount(() => {
    api.getRsyncJobs();
  });

  const openModal = (job?: any) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        uuid: job.uuid || '',
        enable: job.enable ?? true,
        source: job.source || '',
        destination: job.destination || job.target || '',
        recursive: job.recursive ?? true,
        compress: job.compress ?? true,
        preserve: job.preserve ?? true,
        delete: job.delete ?? false,
        bwlimit: job.bwlimit || 0,
        comment: job.comment || '',
      });
    } else {
      setEditingJob(null);
      setFormData({
        uuid: '',
        enable: true,
        source: '',
        destination: '',
        recursive: true,
        compress: true,
        preserve: true,
        delete: false,
        bwlimit: 0,
        comment: '',
      });
    }
    setShowModal(true);
  };

  const saveJob = async () => {
    setLoading('save');
    try {
      await api.setRsyncJob(formData());
      setShowModal(false);
    } finally {
      setLoading(null);
    }
  };

  const deleteJob = async (uuid: string) => {
    if (!confirm('Delete this rsync job?')) return;
    setLoading('delete');
    try {
      await api.deleteRsyncJob(uuid);
    } finally {
      setLoading(null);
    }
  };

  const runJob = async (uuid: string) => {
    if (!confirm('Run this rsync job now?')) return;
    setLoading(`run-${uuid}`);
    try {
      await api.runRsyncJob(uuid);
      alert('Job started');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Rsync Jobs</h1>
        <Button onClick={() => openModal()}>+ Add Job</Button>
      </div>

      <Show
        when={rsyncJobs().length > 0}
        fallback={
          <Card>
            <p class="text-gray-400 text-center py-8">No rsync jobs configured</p>
          </Card>
        }
      >
        <div class="grid gap-4">
          <For each={rsyncJobs()}>
            {(job) => (
              <Card>
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <span class={`w-2 h-2 rounded-full ${job.enable ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <h3 class="font-semibold">{job.comment || job.name || job.uuid?.slice(0, 8) || 'Unnamed Job'}</h3>
                    </div>
                    <p class="text-gray-400 text-sm mt-1 font-mono">
                      {job.source} → {job.destination || job.target}
                    </p>
                    <div class="flex gap-2 mt-2">
                      <Show when={job.recursive}><span class="text-xs bg-gray-700 px-2 py-1 rounded">Recursive</span></Show>
                      <Show when={job.compress}><span class="text-xs bg-gray-700 px-2 py-1 rounded">Compress</span></Show>
                      <Show when={job.preserve}><span class="text-xs bg-gray-700 px-2 py-1 rounded">Preserve</span></Show>
                      <Show when={job.delete}><span class="text-xs bg-red-900 px-2 py-1 rounded">Delete</span></Show>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button size="sm" variant="success" loading={loading(`run-${job.uuid}`)} onClick={() => runJob(job.uuid)}>Run</Button>
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
        <Modal title={editingJob() ? 'Edit Rsync Job' : 'Add Rsync Job'} onClose={() => setShowModal(false)}>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Name/Comment</label>
              <input
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                value={formData().comment}
                onInput={(e) => setFormData({ ...formData(), comment: e.currentTarget.value })}
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Source Path</label>
              <input
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono"
                value={formData().source}
                onInput={(e) => setFormData({ ...formData(), source: e.currentTarget.value })}
                placeholder="/path/to/source"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Destination (user@host:/path or /local/path)</label>
              <input
                type="text"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono"
                value={formData().destination}
                onInput={(e) => setFormData({ ...formData(), destination: e.currentTarget.value })}
                placeholder="user@server:/path or /mnt/backup"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recursive"
                  checked={formData().recursive}
                  onChange={(e) => setFormData({ ...formData(), recursive: e.currentTarget.checked })}
                />
                <label for="recursive" class="text-sm text-gray-300">Recursive</label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="compress"
                  checked={formData().compress}
                  onChange={(e) => setFormData({ ...formData(), compress: e.currentTarget.checked })}
                />
                <label for="compress" class="text-sm text-gray-300">Compress</label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserve"
                  checked={formData().preserve}
                  onChange={(e) => setFormData({ ...formData(), preserve: e.currentTarget.checked })}
                />
                <label for="preserve" class="text-sm text-gray-300">Preserve Permissions</label>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="delete"
                  checked={formData().delete}
                  onChange={(e) => setFormData({ ...formData(), delete: e.currentTarget.checked })}
                />
                <label for="delete" class="text-sm text-gray-300">Delete Extra Files</label>
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Bandwidth Limit (KB/s, 0 = unlimited)</label>
              <input
                type="number"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                value={formData().bwlimit}
                onInput={(e) => setFormData({ ...formData(), bwlimit: parseInt(e.currentTarget.value) || 0 })}
              />
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
              <Button loading={loading() === 'save'} onClick={saveJob}>Save</Button>
            </div>
          </div>
        </Modal>
      </Show>
    </div>
  );
}
