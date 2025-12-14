import React, { useEffect, useRef } from 'react';

interface DataChartProps {
  data: any[];
  layout?: any;
}

export const DataChart: React.FC<DataChartProps> = ({ data, layout }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && (window as any).Plotly) {
      const defaultLayout = {
        font: { family: 'Inter, sans-serif' },
        margin: { t: 40, r: 20, l: 40, b: 40 },
        autosize: true,
        height: 300,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        ...layout
      };

      const config = { responsive: true, displayModeBar: false };
      
      (window as any).Plotly.newPlot(chartRef.current, data, defaultLayout, config);
    }
  }, [data, layout]);

  return <div ref={chartRef} className="w-full rounded-lg" />;
};