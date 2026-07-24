import { useState, useEffect } from 'react';

export function useDemoDataEngine() {
  const [cpuData, setCpuData] = useState<{ time: string, value: number }[]>([]);
  const [memoryData, setMemoryData] = useState<{ time: string, value: number }[]>([]);
  const [throughputIn, setThroughputIn] = useState<{ time: string, value: number }[]>([]);
  const [throughputOut, setThroughputOut] = useState<{ time: string, value: number }[]>([]);

  // Base state values
  const [currentCpu, setCurrentCpu] = useState(24);
  const [currentMemory, setCurrentMemory] = useState(61);
  const [currentLatency, setCurrentLatency] = useState(4);
  
  // Incident feed (alerts)
  const [incidents, setIncidents] = useState([
    { id: 1, time: '10:01', message: 'Core Router offline', severity: 'critical' },
    { id: 2, time: '10:03', message: 'Core Router recovered', severity: 'info' },
    { id: 3, time: '10:09', message: 'CPU spike on Server-02 (95%)', severity: 'warning' },
    { id: 4, time: '10:17', message: 'UPS battery low warning', severity: 'warning' },
    { id: 5, time: '10:20', message: 'High latency on WAN link (120ms)', severity: 'warning' },
  ]);

  // Initial population of chart data (last 20 points)
  useEffect(() => {
    const initData = () => {
      const cpu = [];
      const mem = [];
      const netIn = [];
      const netOut = [];
      const now = new Date();
      
      for (let i = 20; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5000).toLocaleTimeString([], { hour12: false });
        cpu.push({ time, value: 20 + Math.random() * 10 });
        mem.push({ time, value: 60 + Math.random() * 5 });
        netIn.push({ time, value: 50 + Math.random() * 100 });
        netOut.push({ time, value: 30 + Math.random() * 80 });
      }
      
      setCpuData(cpu);
      setMemoryData(mem);
      setThroughputIn(netIn);
      setThroughputOut(netOut);
    };
    
    initData();
  }, []);

  // Tick every 5 seconds to simulate real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour12: false });
      
      // Generate new values based on random walk
      setCurrentCpu(prev => Math.max(5, Math.min(95, prev + (Math.random() * 8 - 4))));
      setCurrentMemory(prev => Math.max(20, Math.min(90, prev + (Math.random() * 4 - 2))));
      setCurrentLatency(prev => Math.max(1, Math.min(50, prev + (Math.random() * 6 - 3))));
      
      const newNetIn = 50 + Math.random() * 200;
      const newNetOut = 30 + Math.random() * 150;

      setCpuData(prev => [...prev.slice(1), { time: now, value: currentCpu }]);
      setMemoryData(prev => [...prev.slice(1), { time: now, value: currentMemory }]);
      setThroughputIn(prev => [...prev.slice(1), { time: now, value: newNetIn }]);
      setThroughputOut(prev => [...prev.slice(1), { time: now, value: newNetOut }]);
      
      // Randomly inject an incident (10% chance per tick)
      if (Math.random() < 0.1) {
        const fakeIncidents = [
          { message: 'SNMP Timeout on Edge Switch', severity: 'warning' },
          { message: 'BGP session flap detected', severity: 'critical' },
          { message: 'Configuration change detected', severity: 'info' },
          { message: 'Interface Gi0/1 down', severity: 'critical' },
          { message: 'Collector heartbeat restored', severity: 'info' },
        ];
        
        const randomIncident = fakeIncidents[Math.floor(Math.random() * fakeIncidents.length)];
        
        setIncidents(prev => {
          const updated = [
            { id: Date.now(), time: now.substring(0,5), ...randomIncident },
            ...prev
          ];
          return updated.slice(0, 8); // Keep last 8 incidents
        });
      }

    }, 5000); // 5 seconds
    
    return () => clearInterval(interval);
  }, [currentCpu, currentMemory]);

  return {
    cpuData,
    memoryData,
    throughputIn,
    throughputOut,
    currentCpu: currentCpu.toFixed(1),
    currentMemory: currentMemory.toFixed(1),
    currentLatency: currentLatency.toFixed(1),
    incidents,
  };
}
