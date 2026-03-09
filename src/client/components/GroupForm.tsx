// Group Form Modal
import { createSignal, createEffect, Show, For } from 'solid-js';
import { Modal } from './Modal';
import { Button } from './Button';
import type { Group, GroupInput, User } from '../../shared/types';

interface GroupFormProps {
  open: boolean;
  group?: Group | null;
  users: User[];
  onClose: () => void;
  onSave: (group: GroupInput) => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function GroupForm(props: GroupFormProps) {
  const [groupname, setGroupname] = createSignal('');
  const [selectedMembers, setSelectedMembers] = createSignal<string[]>([]);
  const [errors, setErrors] = createSignal<Record<string, string>>({});

  createEffect(() => {
    if (props.open) {
      if (props.group) {
        setGroupname(props.group.name);
        setSelectedMembers(props.group.members || []);
      } else {
        setGroupname('');
        setSelectedMembers([]);
      }
      setErrors({});
    }
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!groupname().trim()) {
      newErrors.groupname = 'Group name is required';
    } else if (!/^[a-z_][a-z0-9_-]*$/.test(groupname())) {
      newErrors.groupname = 'Invalid group name (lowercase letters, numbers, underscore only)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!validate()) return;
    
    props.onSave({
      groupname: groupname().trim(),
      members: selectedMembers(),
    });
  };

  const toggleMember = (username: string) => {
    setSelectedMembers(prev => 
      prev.includes(username)
        ? prev.filter(m => m !== username)
        : [...prev, username]
    );
  };

  const availableUsers = () => props.users.map(u => u.name);

  return (
    <Modal open={props.open} title={props.group ? 'Edit Group' : 'Create Group'} onClose={props.onClose}>
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Group Name</label>
          <input
            type="text"
            value={groupname()}
            onInput={(e) => setGroupname(e.target.value)}
            disabled={!!props.group}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            placeholder="e.g., media"
          />
          <Show when={errors().groupname}>
            <p class="text-red-400 text-sm mt-1">{errors().groupname}</p>
          </Show>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Members</label>
          <div class="flex flex-wrap gap-2">
            <For each={availableUsers()}>
              {(username) => (
                <button
                  type="button"
                  onClick={() => toggleMember(username)}
                  class={`px-3 py-1 rounded text-sm border ${
                    selectedMembers().includes(username)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {username}
                </button>
              )}
            </For>
          </div>
          <Show when={props.users.length === 0}>
            <p class="text-gray-500 text-sm mt-1">No users available</p>
          </Show>
        </div>

        <div class="flex justify-between pt-4">
          <div>
            <Show when={props.group && props.onDelete && !['users', 'root', 'sudo', 'adm'].includes(props.group.name)}>
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
              {props.group ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
