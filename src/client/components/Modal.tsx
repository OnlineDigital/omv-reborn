// Modal Component
import { JSX, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: JSX.Element;
}

export function Modal(props: ModalProps) {
  return (
    <Show when={props.open}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/60" onClick={props.onClose} />
          <div class="relative bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-white">{props.title}</h2>
              <button 
                onClick={props.onClose}
                class="text-gray-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  );
}
