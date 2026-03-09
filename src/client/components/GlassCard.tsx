// Glass Card Component
import { JSX, splitProps } from 'solid-js';

interface GlassCardProps {
  title?: string;
  children: JSX.Element;
  class?: string;
  titleAction?: JSX.Element;
}

export function GlassCard(props: GlassCardProps) {
  const [local, others] = splitProps(props, ['title', 'children', 'class', 'titleAction']);

  return (
    <div class={`glass-card rounded-2xl p-6 ${local.class || ''}`} {...others}>
      {local.title && (
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-semibold text-lg">{local.title}</h2>
          {local.titleAction}
        </div>
      )}
      {local.children}
    </div>
  );
}
