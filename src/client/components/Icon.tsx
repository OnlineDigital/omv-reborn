// Icon wrapper component for Lucide Solid icons
import { Icon as Iconify } from 'lucide-solid';
import { Component } from 'solid-js';

interface IconProps {
  name: string;
  class?: string;
  size?: number;
}

export const Icon: Component<IconProps> = (props) => {
  return (
    <Iconify
      name={props.name as any}
      class={props.class || ''}
      width={props.size || 20}
      height={props.size || 20}
    />
  );
};
