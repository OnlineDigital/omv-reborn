// Card Component
import { JSX, splitProps } from 'solid-js';

interface CardProps {
  title?: string;
  children: JSX.Element;
  class?: string;
}

export function Card(props: CardProps) {
  const [local, others] = splitProps(props, ['title', 'children', 'class']);
  
  return (
    <div class={`bg-gray-800 rounded-lg p-4 shadow-lg ${local.class || ''}`}>
      {local.title && (
        <h3 class="text-lg font-semibold text-gray-200 mb-3">{local.title}</h3>
      )}
      {local.children}
    </div>
  );
}
