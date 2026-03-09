// Toggle Switch Component
import { Component, splitProps } from 'solid-js';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  class?: string;
}

export const ToggleSwitch: Component<ToggleSwitchProps> = (props) => {
  const [local, others] = splitProps(props, ['checked', 'onChange', 'disabled', 'class']);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={local.checked}
      disabled={local.disabled}
      onClick={() => !local.disabled && local.onChange(!local.checked)}
      class={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        local.checked ? 'bg-indigo-600' : 'bg-slate-700'
      } ${local.disabled ? 'opacity-60 cursor-not-allowed' : ''} ${local.class || ''}`}
      {...others}
    >
      <span
        aria-hidden="true"
        class={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          local.checked ? 'translate-x-5' : 'translate-x-0.5'
        } ${local.checked ? 'right-0.5' : 'left-0.5'} absolute top-0.5`}
      />
    </button>
  );
};
