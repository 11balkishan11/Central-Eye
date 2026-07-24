import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';

export function CpuChart({ data }: { data: { time: string, value: number }[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const option = {
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time),
      axisLabel: { color: isDark ? '#888' : '#666', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } },
      axisLabel: { color: isDark ? '#888' : '#666', fontSize: 10 }
    },
    series: [
      {
        data: data.map(item => item.value),
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.5)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }]
          }
        }
      }
    ],
    tooltip: { trigger: 'axis' },
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />;
}

export function MemoryChart({ data }: { data: { time: string, value: number }[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const option = {
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time),
      axisLabel: { color: isDark ? '#888' : '#666', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } },
      axisLabel: { color: isDark ? '#888' : '#666', fontSize: 10 }
    },
    series: [
      {
        data: data.map(item => item.value),
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#8b5cf6' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(139, 92, 246, 0.5)' }, { offset: 1, color: 'rgba(139, 92, 246, 0.0)' }]
          }
        }
      }
    ],
    tooltip: { trigger: 'axis' },
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />;
}

export function NetworkChart({ dataIn, dataOut }: { dataIn: { time: string, value: number }[], dataOut: { time: string, value: number }[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const option = {
    grid: { top: 10, right: 10, bottom: 20, left: 40 },
    legend: { data: ['In', 'Out'], textStyle: { color: isDark ? '#888' : '#666' }, top: 0, right: 0 },
    xAxis: {
      type: 'category',
      data: dataIn.map(item => item.time),
      axisLabel: { color: isDark ? '#888' : '#666', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } },
      axisLabel: { color: isDark ? '#888' : '#666', fontSize: 10 }
    },
    series: [
      {
        name: 'In',
        data: dataIn.map(item => item.value),
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#10b981' },
      },
      {
        name: 'Out',
        data: dataOut.map(item => item.value),
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#f59e0b' },
      }
    ],
    tooltip: { trigger: 'axis' },
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />;
}

export function HealthDonutChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const option = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom', textStyle: { color: isDark ? '#aaa' : '#444' } },
    series: [
      {
        name: 'Health',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 5, borderColor: isDark ? '#000' : '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: isDark ? '#fff' : '#000' } },
        labelLine: { show: false },
        data: [
          { value: 480, name: 'Healthy', itemStyle: { color: '#10b981' } },
          { value: 21, name: 'Warning', itemStyle: { color: '#f59e0b' } },
          { value: 11, name: 'Critical', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />;
}
