export type PersonaType = "Enterprise" | "Hospital" | "Manufacturing" | "Retail" | "ISP" | "Cloud";

export interface PersonaData {
  id: PersonaType;
  name: string;
  description: string;
  nodesCount: number;
  criticalAlerts: number;
  warningAlerts: number;
  mission: string;
  aiPrompt: string;
  aiResponse: string;
  topology: any[]; // Simplified for demo
}

export const personas: PersonaData[] = [
  {
    id: "Enterprise",
    name: "Global Enterprise",
    description: "Multinational corporation with 4 major hubs, redundant datacenters, and a heavy SD-WAN footprint.",
    nodesCount: 342,
    criticalAlerts: 2,
    warningAlerts: 14,
    mission: "Investigate connectivity drop in the London Branch SD-WAN fabric.",
    aiPrompt: "Why is the London office experiencing intermittent packet loss to the AWS VPC?",
    aiResponse: "The BGP session on lon-edge-02 has been flapping for 45 minutes due to an MTU mismatch introduced in the last automated Ansible push.",
    topology: []
  },
  {
    id: "Hospital",
    name: "Regional Healthcare",
    description: "High-security network handling HIPAA data, IoT medical devices, and strict Zero Trust segmentation.",
    nodesCount: 512,
    criticalAlerts: 1,
    warningAlerts: 8,
    mission: "Find the unauthorized IoT device on the surgical VLAN.",
    aiPrompt: "Are there any policy violations on VLAN 200 (Surgical)?",
    aiResponse: "Yes. An unknown MAC address was discovered on port gi1/0/24 of switch hsp-surg-01. It is communicating via unencrypted HTTP, violating the Zero Trust policy.",
    topology: []
  },
  {
    id: "Manufacturing",
    name: "Automotive Manufacturing",
    description: "OT and IT convergence. Massive flat networks for factory floors combined with strict DMZs.",
    nodesCount: 850,
    criticalAlerts: 0,
    warningAlerts: 24,
    mission: "Trace the latency path between the robotics controller and the SCADA server.",
    aiPrompt: "Show me the exact Layer 2 path from robot-arm-7 to scada-db-01.",
    aiResponse: "The path traverses 4 switches. Warning: The link between mfg-dist-02 and mfg-core-01 is experiencing 85% utilization due to a scheduled firmware backup.",
    topology: []
  },
  {
    id: "Retail",
    name: "National Retail Chain",
    description: "Thousands of small identical branches connected via VPN over broadband back to a central cloud.",
    nodesCount: 1200,
    criticalAlerts: 12,
    warningAlerts: 45,
    mission: "Identify the configuration drift across 400 point-of-sale routers.",
    aiPrompt: "Which retail branches do not have the updated PCI-DSS firewall rules?",
    aiResponse: "I found 12 stores (Store 405 through 416) running an outdated configuration template. The 'permit any' rule on the guest WiFi interface was not removed. Generating remediation playbook.",
    topology: []
  },
  {
    id: "ISP",
    name: "Tier-2 Service Provider",
    description: "Massive BGP routing tables, MPLS backbones, and heavy peering configurations.",
    nodesCount: 150,
    criticalAlerts: 3,
    warningAlerts: 5,
    mission: "Simulate the blast radius of taking the Chicago peering router offline.",
    aiPrompt: "If I disable chi-peer-01 for maintenance, what is the impact?",
    aiResponse: "Simulating chi-peer-01 down: 45 BGP sessions will drop. Traffic will reroute via ny-peer-02. However, the link ny-peer-02 <-> wdc-core-01 will saturate at 98% capacity. Maintenance not recommended.",
    topology: []
  },
  {
    id: "Cloud",
    name: "Cloud-Native FinTech",
    description: "100% cloud footprint. Transit gateways, Kubernetes clusters, and complex security groups.",
    nodesCount: 220,
    criticalAlerts: 0,
    warningAlerts: 3,
    mission: "Verify the routing path from the public ALB to the internal EKS pods.",
    aiPrompt: "Why can't the API Gateway reach the payment-processing service in EKS?",
    aiResponse: "A recent Terraform deployment modified Security Group 'sg-finance-internal'. It removed the ingress rule allowing TCP 8443 from the private subnet where the API Gateway resides.",
    topology: []
  }
];
