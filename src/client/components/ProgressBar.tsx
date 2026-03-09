// ProgressBar Component

interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
}

export function ProgressBar(props: ProgressBarProps) {
  const percent = () => Math.min(100, Math.max(0, props.value));
  
  const color = () => {
    const p = percent();
    if (p > 90) return 'bg-red-500';
    if (p > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div class="w-full">
      <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          class={`h-full ${color()} transition-all duration-300`}
          style={{ width: `${percent()}%` }}
        />
      </div>
      {props.showLabel && (
        <div class="text-sm text-gray-400 mt-1">{percent().toFixed(1)}%</div>
      )}
    </div>
  );
}
