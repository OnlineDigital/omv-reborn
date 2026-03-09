// Table Component
import { JSX, For } from 'solid-js';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => JSX.Element;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
}

export function Table<T extends Record<string, any>>(props: TableProps<T>) {
  return (
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700">
            <For each={props.columns}>
              {(col) => (
                <th class="text-left py-3 px-4 text-gray-400 font-medium">{col.header}</th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.data}>
            {(item) => (
              <tr class="border-b border-gray-700/50 hover:bg-gray-700/30">
                <For each={props.columns}>
                  {(col) => (
                    <td class="py-3 px-4">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
