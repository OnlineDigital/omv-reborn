// RAM Line Chart Component with SVG
import { Component } from 'solid-js';

interface RamChartProps {
  data?: number[];
  height?: string;
}

export const RamChart: Component<RamChartProps> = (props) => {
  const defaultData = props.data || [85, 75, 82, 65, 78, 55, 70, 85, 75, 82, 65, 78];
  const height = props.height || '160px';

  // Generate SVG path from data points
  const generatePath = (data: number[]) => {
    const max = 100;
    const min = 0;
    const range = max - min;
    const step = 100 / (data.length - 1);

    let path = `M0 ${100 - ((data[0] - min) / range) * 100}`;
    for (let i = 1; i < data.length; i++) {
      const x = i * step;
      const y = 100 - ((data[i] - min) / range) * 100;
      path += ` Q ${x - step/2} ${100 - ((data[i-1] - min) / range) * 100}, ${x} ${y}`;
    }
    return path;
  };

  const generateAreaPath = (data: number[]) => {
    const linePath = generatePath(data);
    return `${linePath} V 100 H 0 Z`;
  };

  return (
    <div class="flex-1 bg-slate-800/50 rounded-xl relative overflow-hidden border border-slate-700/50" style={{ height }}>
      <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d={generateAreaPath(defaultData)}
          fill="url(#ramGradient)"
        />
        <path
          d={generatePath(defaultData)}
          fill="none"
          stroke="#6366f1"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};
