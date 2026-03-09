// Settings Page
import { onMount, Show, createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api, systemInfo, stats } from '../stores/system';

export function Settings() {
  const [showRebootModal, setShowRebootModal] = createSignal(false);
  const [showShutdownModal, setShowShutdownModal] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  
  onMount(() => {
    api.getSystemInfo();
  });
  
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };
  
  const handleReboot = async () => {
    setLoading(true);
    try {
      await api.reboot();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setShowRebootModal(false);
    }
  };
  
  const handleShutdown = async () => {
    setLoading(true);
    try {
      await api.shutdown();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setShowShutdownModal(false);
    }
  };
  
  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Settings</h1>
      
      <Card title="System Information">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-gray-400 text-sm">Hostname</div>
            <div class="text-lg">{systemInfo()?.hostname || 'N/A'}</div>
          </div>
          <div>
            <div class="text-gray-400 text-sm">Version</div>
            <div class="text-lg">{systemInfo()?.version || 'N/A'}</div>
          </div>
          <div>
            <div class="text-gray-400 text-sm">Distribution</div>
            <div class="text-lg">{systemInfo()?.distro || 'N/A'}</div>
          </div>
          <div>
            <div class="text-gray-400 text-sm">Kernel</div>
            <div class="text-lg">{systemInfo()?.kernel || 'N/A'}</div>
          </div>
          <div>
            <div class="text-gray-400 text-sm">Architecture</div>
            <div class="text-lg">{systemInfo()?.arch || 'N/A'}</div>
          </div>
          <div>
            <div class="text-gray-400 text-sm">Uptime</div>
            <div class="text-lg">{formatUptime(stats()?.uptime || systemInfo()?.uptime || 0)}</div>
          </div>
        </div>
      </Card>
      
      <Card title="Power Actions">
        <div class="flex gap-4">
          <Button variant="primary" onClick={() => setShowRebootModal(true)}>
            Reboot
          </Button>
          <Button variant="danger" onClick={() => setShowShutdownModal(true)}>
            Shutdown
          </Button>
        </div>
      </Card>
      
      <Modal 
        open={showRebootModal()} 
        title="Confirm Reboot"
        onClose={() => setShowRebootModal(false)}
      >
        <p class="mb-4">Are you sure you want to reboot the system?</p>
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setShowRebootModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" loading={loading()} onClick={handleReboot}>
            Reboot
          </Button>
        </div>
      </Modal>
      
      <Modal 
        open={showShutdownModal()} 
        title="Confirm Shutdown"
        onClose={() => setShowShutdownModal(false)}
      >
        <p class="mb-4">Are you sure you want to shutdown the system?</p>
        <div class="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setShowShutdownModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading()} onClick={handleShutdown}>
            Shutdown
          </Button>
        </div>
      </Modal>
    </div>
  );
}
