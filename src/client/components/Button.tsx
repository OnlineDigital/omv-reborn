// Button Component
import { JSX, splitProps } from 'solid-js';

interface ButtonProps {
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: JSX.Element;
  class?: string;
}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, ['variant', 'size', 'disabled', 'loading', 'onClick', 'children', 'class']);
  
  const base = 'font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const variant = local.variant || 'primary';
  const size = local.size || 'md';
  
  return (
    <button
      class={`${base} ${variants[variant]} ${sizes[size]} ${local.class || ''}`}
      disabled={local.disabled || local.loading}
      onClick={local.onClick}
      {...others}
    >
      {local.loading ? 'Loading...' : local.children}
    </button>
  );
}
