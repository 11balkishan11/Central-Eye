export type DeviceType = "router" | "switch" | "firewall" | "server" | "vm" | "kubernetes";
export type Location = "New York HQ" | "London Office" | "Singapore DC" | "Mumbai Branch" | "AWS VPC" | "Azure Region";

export interface DemoDevice {
  id: string;
  hostname: string;
  type: DeviceType;
  location: Location;
  vendor: string;
  ip: string;
  status: "healthy" | "warning" | "critical" | "offline";
  drift: boolean;
}

export interface DemoLink {
  source: string;
  target: string;
  type: "wan" | "lan" | "vpn" | "fiber";
  status: "up" | "down" | "degraded";
}

const locations: Location[] = ["New York HQ", "London Office", "Singapore DC", "Mumbai Branch", "AWS VPC", "Azure Region"];
const vendors = ["Cisco", "Juniper", "Arista", "Palo Alto", "VMware", "Linux"];

// Procedurally generate 300+ devices
function generateDevices(): DemoDevice[] {
  const devices: DemoDevice[] = [];
  let idCounter = 1;

  locations.forEach(loc => {
    // Each location gets core routers and firewalls
    devices.push({ id: `rtr-${idCounter++}`, hostname: `${loc.split(' ')[0].toLowerCase()}-core-rtr-01`, type: "router", location: loc, vendor: "Cisco", ip: `10.${idCounter}.0.1`, status: "healthy", drift: false });
    devices.push({ id: `fw-${idCounter++}`, hostname: `${loc.split(' ')[0].toLowerCase()}-edge-fw-01`, type: "firewall", location: loc, vendor: "Palo Alto", ip: `10.${idCounter}.0.1`, status: "healthy", drift: false });

    // Distribution & Access switches
    for (let i = 0; i < 5; i++) {
      devices.push({ id: `sw-${idCounter++}`, hostname: `${loc.split(' ')[0].toLowerCase()}-dist-sw-0${i + 1}`, type: "switch", location: loc, vendor: "Arista", ip: `10.${idCounter}.0.2`, status: "healthy", drift: Math.random() > 0.9 });
    }

    // Servers / Compute
    const serverCount = loc.includes("DC") || loc.includes("VPC") || loc.includes("Region") ? 40 : 10;
    for (let i = 0; i < serverCount; i++) {
      const isK8s = Math.random() > 0.7;
      devices.push({
        id: `srv-${idCounter++}`,
        hostname: `${loc.split(' ')[0].toLowerCase()}-${isK8s ? 'k8s' : 'vm'}-node-${i}`,
        type: isK8s ? "kubernetes" : "vm",
        location: loc,
        vendor: isK8s ? "Linux" : "VMware",
        ip: `10.${idCounter}.1.${i + 10}`,
        status: Math.random() > 0.95 ? "warning" : "healthy",
        drift: false
      });
    }
  });

  return devices;
}

function generateLinks(devices: DemoDevice[]): DemoLink[] {
  const links: DemoLink[] = [];

  // WAN Links between cores
  const cores = devices.filter(d => d.type === "router");
  for (let i = 0; i < cores.length - 1; i++) {
    links.push({ source: cores[i].id, target: cores[i + 1].id, type: "wan", status: "up" });
  }
  // Ring topology completion
  links.push({ source: cores[cores.length - 1].id, target: cores[0].id, type: "wan", status: "up" });

  return links;
}

export const demoDataset = {
  devices: generateDevices(),
  links: generateLinks(generateDevices()),
};
