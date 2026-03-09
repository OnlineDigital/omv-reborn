// Shares Page
import { onMount, Show, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { ShareForm } from '../components/ShareForm';
import { api, shares } from '../stores/system';
import type { Share, ShareInput } from '../../shared/types';

export function Shares() {
  const [loading, setLoading] = createSignal(false);
  const [formOpen, setFormOpen] = createSignal(false);
  const [selectedShare, setSelectedShare] = createSignal<Share | null>(null);
  const [deleteConfirm, setDeleteConfirm] = createSignal<string | null>(null);
  
  onMount(() => {
    api.getShares();
  });
  
  const columns = [
    { key: 'type', header: 'Type' },
    { key: 'name', header: 'Name' },
    { key: 'path', header: 'Path' },
    { key: 'comment', header: 'Comment' },
    { 
      key: 'public', 
      header: 'Public',
      render: (s: Share) => s.public ? 'Yes' : 'No'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: Share) => (
        <div class="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditForm(s)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>
            Delete
          </Button>
        </div>
      )
    },
  ];
  
  const openCreateForm = () => {
    setSelectedShare(null);
    setFormOpen(true);
  };
  
  const openEditForm = (share: Share) => {
    setSelectedShare(share);
    setFormOpen(true);
  };
  
  const handleSave = async (share: ShareInput) => {
    setLoading(true);
    try {
      if (selectedShare()) {
        await api.updateShare(selectedShare()!.uuid, share);
      } else {
        await api.createShare(share);
      }
      setFormOpen(false);
      setSelectedShare(null);
    } catch (err) {
      console.error('Failed to save share:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (share: Share) => {
    if (!confirm(`Are you sure you want to delete "${share.name}"?`)) return;
    
    setLoading(true);
    try {
      await api.deleteShare(share.uuid);
    } catch (err) {
      console.error('Failed to delete share:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Shares</h1>
        <Button onClick={openCreateForm}>+ Add Share</Button>
      </div>
      
      <Card>
        <Show 
          when={shares().length > 0}
          fallback={<p class="text-gray-400">No shares found</p>}
        >
          <Table columns={columns} data={shares()} keyField="uuid" />
        </Show>
      </Card>
      
      <ShareForm
        open={formOpen()}
        share={selectedShare()}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        loading={loading()}
      />
    </div>
  );
}
