// Network Area Chart Component with SVG
import { Component } from 'solid-js';

interface NetworkChartProps {
  rxData?: number[];
  txData?: number[];
  height?: string;
}

export const NetworkChart: Component<NetworkChartProps> = (props) => {
  const defaultRxData = props.rxData || [30, 25, 35, 20, 30, 25, 35, 20, 30, 25, 35, 20];
  const defaultTxData = props.txData || [35, 38, 20, 25, 35, 38, 20, 25, 35, 38, 20, 25];
  const height = props.height || '160px';

  // Generate SVG path from data points
  const generatePath = (data: number[]) => {
    const max = 50; // Scale for network values
    const min = 0;
    const range = max - min;
    const step = 100 / (data.length - 1);

    let path = `M0 ${((data[0] - min) / range) * 40 + 30}`; // Scale to fit in view
    for (let i = 1; i < data.length; i++) {
      const x = i * step;
      const y = ((data[i] - min) / range) * 40 + 30;
      path += ` Q ${x - step/2} ${((data[i-1] - min) / range) * 40 + 30}, ${x} ${y}`;
    }
    return path;
  };

  const generateAreaPath = (data: number[]) => {
    const linePath = generatePath(data);
    return `${linePath.replace('M0 ', 'M0 40 L0 ')} L 100 40 Z`;
  };

  return (
    <div class="h-40 w-full" style={{ height }}>
      <svg class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
        <defs>
          <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ec4899" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#ec4899" stop-opacity="0" />
          </linearGradient>
        </defs>
        {/* RX (Inbound) - Indigo */}
        <path
          d={generateAreaPath(defaultRxData)}
          fill="url(#rxGradient)"
        />
        <path
          d={generatePath(defaultRxData)}
          fill="none"
          stroke="#6366f1"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
        {/* TX (Outbound) - Pink */}
        <path
          d={generateAreaPath(defaultTxData)}
          fill="url(#txGradient)"
        />
        <path
          d={generatePath(defaultTxData)}
          fill="none"
          stroke="#ec4899"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};
