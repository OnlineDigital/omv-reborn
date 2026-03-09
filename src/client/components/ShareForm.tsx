// Share Form Modal
import { createSignal, createEffect, Show } from 'solid-js';
import { Modal } from './Modal';
import { Button } from './Button';
import type { Share, ShareInput } from '../../shared/types';

interface ShareFormProps {
  open: boolean;
  share?: Share | null;
  onClose: () => void;
  onSave: (share: ShareInput) => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function ShareForm(props: ShareFormProps) {
  const [type, setType] = createSignal<'smb' | 'nfs'>('smb');
  const [name, setName] = createSignal('');
  const [path, setPath] = createSignal('');
  const [comment, setComment] = createSignal('');
  const [isPublic, setIsPublic] = createSignal(false);
  const [errors, setErrors] = createSignal<Record<string, string>>({});

  createEffect(() => {
    if (props.open) {
      if (props.share) {
        setType(props.share.type);
        setName(props.share.name);
        setPath(props.share.path);
        setComment(props.share.comment);
        setIsPublic(props.share.public);
      } else {
        setType('smb');
        setName('');
        setPath('');
        setComment('');
        setIsPublic(false);
      }
      setErrors({});
    }
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name().trim()) {
      newErrors.name = 'Name is required';
    }
    if (!path().trim()) {
      newErrors.path = 'Path is required';
    }
    if (!path().startsWith('/')) {
      newErrors.path = 'Path must start with /';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!validate()) return;
    
    props.onSave({
      type: type(),
      name: name().trim(),
      path: path().trim(),
      comment: comment().trim(),
      public: isPublic(),
    });
  };

  return (
    <Modal open={props.open} title={props.share ? 'Edit Share' : 'Create Share'} onClose={props.onClose}>
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Type</label>
          <select
            value={type()}
            onChange={(e) => setType(e.target.value as 'smb' | 'nfs')}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="smb">SMB/CIFS</option>
            <option value="nfs">NFS</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.target.value)}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., movies"
          />
          <Show when={errors().name}>
            <p class="text-red-400 text-sm mt-1">{errors().name}</p>
          </Show>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Path</label>
          <input
            type="text"
            value={path()}
            onInput={(e) => setPath(e.target.value)}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="/srv/dev/disk0/shares/movies"
          />
          <Show when={errors().path}>
            <p class="text-red-400 text-sm mt-1">{errors().path}</p>
          </Show>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Comment</label>
          <input
            type="text"
            value={comment()}
            onInput={(e) => setComment(e.target.value)}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Optional description"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="public"
            checked={isPublic()}
            onChange={(e) => setIsPublic(e.target.checked)}
            class="w-4 h-4 rounded bg-gray-700 border-gray-600"
          />
          <label for="public" class="text-sm text-gray-300">Public access (no password)</label>
        </div>

        <div class="flex justify-between pt-4">
          <div>
            <Show when={props.share && props.onDelete}>
              <Button
                type="button"
                variant="danger"
                onClick={props.onDelete}
                loading={props.loading}
              >
                Delete
              </Button>
            </Show>
          </div>
          <div class="flex gap-2">
            <Button type="button" variant="secondary" onClick={props.onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={props.loading}>
              {props.share ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
