// User Form Modal
import { createSignal, createEffect, Show, For } from 'solid-js';
import { Modal } from './Modal';
import { Button } from './Button';
import type { User, UserInput, Group } from '../../shared/types';

interface UserFormProps {
  open: boolean;
  user?: User | null;
  groups: Group[];
  onClose: () => void;
  onSave: (user: UserInput) => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function UserForm(props: UserFormProps) {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [shell, setShell] = createSignal('/bin/sh');
  const [selectedGroups, setSelectedGroups] = createSignal<string[]>([]);
  const [errors, setErrors] = createSignal<Record<string, string>>({});

  const shells = ['/bin/sh', '/bin/bash', '/bin/zsh', '/usr/sbin/nologin', '/bin/false'];

  createEffect(() => {
    if (props.open) {
      if (props.user) {
        setUsername(props.user.name);
        setPassword('');
        setEmail(props.user.email || '');
        setShell(props.user.shell);
        setSelectedGroups(props.user.groups || []);
      } else {
        setUsername('');
        setPassword('');
        setEmail('');
        setShell('/bin/sh');
        setSelectedGroups([]);
      }
      setErrors({});
    }
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!username().trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-z_][a-z0-9_-]*$/.test(username())) {
      newErrors.username = 'Invalid username (lowercase letters, numbers, underscore only)';
    }
    
    if (!props.user && !password()) {
      newErrors.password = 'Password is required for new users';
    }
    if (password() && password().length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!validate()) return;
    
    props.onSave({
      username: username().trim(),
      password: password() || undefined,
      email: email().trim() || undefined,
      shell: shell(),
      groups: selectedGroups(),
    });
  };

  const toggleGroup = (groupName: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  return (
    <Modal open={props.open} title={props.user ? 'Edit User' : 'Create User'} onClose={props.onClose}>
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Username</label>
          <input
            type="text"
            value={username()}
            onInput={(e) => setUsername(e.target.value)}
            disabled={!!props.user}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            placeholder="e.g., john"
          />
          <Show when={errors().username}>
            <p class="text-red-400 text-sm mt-1">{errors().username}</p>
          </Show>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">
            Password {props.user && <span class="text-gray-500">(leave empty to keep current)</span>}
          </label>
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder={props.user ? '••••••••' : 'Enter password'}
          />
          <Show when={errors().password}>
            <p class="text-red-400 text-sm mt-1">{errors().password}</p>
          </Show>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Shell</label>
          <select
            value={shell()}
            onChange={(e) => setShell(e.target.value)}
            class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <For each={shells}>
              {(s) => <option value={s}>{s}</option>}
            </For>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Groups</label>
          <div class="flex flex-wrap gap-2">
            <For each={props.groups}>
              {(group) => (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  class={`px-3 py-1 rounded text-sm border ${
                    selectedGroups().includes(group.name)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {group.name}
                </button>
              )}
            </For>
          </div>
          <Show when={props.groups.length === 0}>
            <p class="text-gray-500 text-sm mt-1">No groups available</p>
          </Show>
        </div>

        <div class="flex justify-between pt-4">
          <div>
            <Show when={props.user && props.onDelete && props.user.name !== 'root'}>
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
              {props.user ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
