export const discoveryContent = {
  hero: {
    title: "Discovery Engine",
    subtitle: "Observation-Based Network Discovery",
    description: "Don't just scan IPs. Observe reality. Our Discovery Engine continuously emits structured observations across ICMP, SNMP, LLDP, CDP, and ARP without creating duplicate devices.",
  },
  problem: {
    title: "The problem with traditional scanning",
    description: "Legacy NMS tools treat IP addresses as devices. When an IP changes, or a device has multiple interfaces, you get duplicate alerts, fragmented history, and inaccurate topologies.",
  },
  solution: {
    title: "How Central Eye Solves It",
    description: "Collectors never create devices. They emit Identity Observations and Neighbor Observations. The Inference Engine deduplicates, correlates, and assembles the true Reality Graph.",
  },
  technical: {
    pipeline: [
      { step: "Collector", desc: "Runs massively concurrent plugins (e.g. 128 ICMP pings/sec)." },
      { step: "Observation", desc: "Emits JSONB structured data: {ip, hostname, vendor}." },
      { step: "Normalization", desc: "Standardizes vendor-specific strings to unified schemas." },
      { step: "Inference", desc: "Merges observations using MAC addresses and serial numbers." },
      { step: "Reality Graph", desc: "Persists the verified Digital Twin to the topology database." },
    ]
  }
};
