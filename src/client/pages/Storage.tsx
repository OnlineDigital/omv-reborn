// Storage Page
import { onMount, Show } from 'solid-js';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { ProgressBar } from '../components/ProgressBar';
import { api, disks, mountPoints } from '../stores/system';
import type { Disk, MountPoint } from '../../shared/types';

export function Storage() {
  onMount(() => {
    api.getDisks();
    api.getMountPoints();
  });
  
  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  const diskColumns = [
    { key: 'devicefile', header: 'Device' },
    { key: 'model', header: 'Model' },
    { 
      key: 'size', 
      header: 'Size',
      render: (d: Disk) => formatBytes(d.size)
    },
    { key: 'serialnumber', header: 'Serial' },
  ];
  
  const mountColumns = [
    { key: 'devicefile', header: 'Device' },
    { key: 'dir', header: 'Mount Point' },
    { key: 'type', header: 'Type' },
    { key: 'opts', header: 'Options' },
  ];
  
  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Storage</h1>
      
      <Card title="Disks">
        <Show 
          when={disks().length > 0}
          fallback={<p class="text-gray-400">No disks found</p>}
        >
          <Table columns={diskColumns} data={disks()} keyField="devicefile" />
        </Show>
      </Card>
      
      <Card title="Mount Points">
        <Show 
          when={mountPoints().length > 0}
          fallback={<p class="text-gray-400">No mount points found</p>}
        >
          <Table columns={mountColumns} data={mountPoints()} keyField="uuid" />
        </Show>
      </Card>
    </div>
  );
}
