"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Copy, Check, Play, BookOpen, Key } from "lucide-react";
import jsyaml from "js-yaml";

// Since we cannot read the filesystem directly in a client component without a server action,
// we will fetch the raw YAML strings. In a production Next.js app, we would use getStaticProps/Server Components to read `fs`.
// For the sake of this interactive demo, we'll embed the parsed YAML content we just created.
const apiSpecs = [
  {
    name: "Discoveries API",
    description: "Endpoints for managing and triggering network discovery sessions.",
    endpoints: [
      {
        id: "create-discovery",
        method: "POST",
        path: "/api/v1/discoveries",
        summary: "Create a Discovery Session",
        description: "Triggers a new asynchronous discovery session across the specified target subnets or IP ranges using the defined protocols.",
        parameters: [
          { name: "targets", type: "array of strings", required: true, description: "List of CIDR blocks or IP addresses to scan." },
          { name: "protocols", type: "array of strings", required: false, description: "List of protocols to use (e.g., ICMP, SNMP, LLDP). Defaults to all available." }
        ],
        requestBody: '{\n  "targets": ["10.0.0.0/24", "192.168.1.1"],\n  "protocols": ["ICMP", "SNMP"]\n}',
        responseBody: '{\n  "id": "dsc_9a8b7c6d",\n  "status": "queued",\n  "targets": ["10.0.0.0/24", "192.168.1.1"],\n  "created_at": "2026-07-27T10:00:00Z"\n}'
      }
    ]
  },
  {
    name: "Digital Twin API",
    description: "Endpoints for querying and traversing the Reality Graph and Intent Graph.",
    endpoints: [
      {
        id: "get-digital-twin",
        method: "GET",
        path: "/api/v1/digital-twin",
        summary: "Retrieve the Topology Graph",
        description: "Returns the current Reality Graph topology, including all nodes and their L2/L3 relationships within the specified scope.",
        parameters: [
          { name: "site_id", type: "string", required: false, description: "Filter the topology by a specific site or datacenter ID." },
          { name: "depth", type: "integer", required: false, description: "Number of hops to include in the graph traversal. Defaults to 3." }
        ],
        requestBody: '',
        responseBody: '{\n  "nodes": [\n    { "id": "fw-core-01", "type": "firewall", "ip": "10.0.0.1" },\n    { "id": "sw-dist-01", "type": "switch", "ip": "10.0.0.2" }\n  ],\n  "links": [\n    { "source": "fw-core-01", "target": "sw-dist-01", "protocol": "LLDP" }\n  ]\n}'
      }
    ]
  },
  {
    name: "Simulation API",
    description: "Endpoints for simulating network topology changes and outages.",
    endpoints: [
      {
        id: "run-simulation",
        method: "POST",
        path: "/api/v1/simulate",
        summary: "Execute 'What If' Simulation",
        description: "Spawns a lightweight clone of the Reality Graph in memory and applies the requested state changes.",
        parameters: [
          { name: "action", type: "string", required: true, description: "The type of failure to simulate (e.g., NODE_DOWN, LINK_CUT)." },
          { name: "target_id", type: "string", required: true, description: "The UUID of the device, link, or BGP session to target." }
        ],
        requestBody: '{\n  "action": "NODE_DOWN",\n  "target_id": "fw-core-01"\n}',
        responseBody: '{\n  "simulation_id": "sim_8f9e0a1b",\n  "blast_radius": {\n    "disconnected_nodes": 142,\n    "orphaned_bgp_sessions": 14,\n    "impacted_applications": ["SAP", "HR Portal"]\n  },\n  "convergence_time_ms": 1240,\n  "recommendation": "Update OSPF cost on backup link ny-core-02."\n}'
      }
    ]
  }
];

export function APIExperience() {
  const [activeSpecIdx, setActiveSpecIdx] = useState(0);
  const [activeLang, setActiveLang] = useState("cURL");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showLiveResponse, setShowLiveResponse] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeSpec = apiSpecs[activeSpecIdx];
  const activeEndpoint = activeSpec.endpoints[0]; // For simplicity in this demo, default to first endpoint

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeLive = () => {
    setIsExecuting(true);
    setShowLiveResponse(false);
    setTimeout(() => {
      setIsExecuting(false);
      setShowLiveResponse(true);
    }, 1500);
  };

  const getCodeSnippet = (method: string, path: string, body: string, lang: string) => {
    switch (lang) {
      case "Python": return `import requests\n\nurl = "https://api.centraleye.ai${path}"\nheaders = {\n    "Authorization": "Bearer YOUR_API_KEY",\n    "Content-Type": "application/json"\n}\n${body ? `data = ${body}` : 'data = {}'}\n\nresponse = requests.request("${method}", url, headers=headers${body ? ', json=data' : ''})\nprint(response.json())`;
      
      case "Go": return `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io/ioutil"\n)\n\nfunc main() {\n\turl := "https://api.centraleye.ai${path}"\n\treq, _ := http.NewRequest("${method}", url, nil)\n\treq.Header.Add("Authorization", "Bearer YOUR_API_KEY")\n\n\tres, _ := http.DefaultClient.Do(req)\n\tdefer res.Body.Close()\n\tbody, _ := ioutil.ReadAll(res.Body)\n\n\tfmt.Println(string(body))\n}`;
      
      case "cURL":
      default: return `curl -X ${method} https://api.centraleye.ai${path} \\\n  -H "Authorization: Bearer YOUR_API_KEY"${body ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${body.replace(/\n/g, '')}'` : ''}`;
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row h-[700px] bg-black border border-white/10 rounded-xl overflow-hidden font-sans">
      
      {/* Left Pane: Navigation */}
      <div className="w-64 bg-white/5 border-r border-white/10 flex flex-col p-4 overflow-y-auto hidden md:flex">
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-6 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> API Reference
        </h3>
        
        {apiSpecs.map((spec, idx) => (
          <div key={idx} className="mb-6">
            <h4 className="text-white font-bold text-sm mb-3">{spec.name}</h4>
            <div className="space-y-1">
              {spec.endpoints.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => { setActiveSpecIdx(idx); setShowLiveResponse(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${activeSpecIdx === idx ? 'bg-[var(--color-brand-cyan-dark)]/30 text-[var(--color-brand-cyan-light)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {ep.method}
                  </span>
                  {ep.summary}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Pane: Documentation & Parameters */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-black">
        <div className="flex items-center gap-3 mb-6">
          <span className={`text-sm font-bold font-mono px-2 py-1 rounded ${activeEndpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
            {activeEndpoint.method}
          </span>
          <span className="text-lg font-mono text-gray-300">{activeEndpoint.path}</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-4">{activeEndpoint.summary}</h1>
        <p className="text-gray-400 mb-10 leading-relaxed">{activeEndpoint.description}</p>

        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Parameters</h2>
        <div className="space-y-6">
          {activeEndpoint.parameters.map((param, i) => (
            <div key={i} className="flex gap-4 border-b border-white/5 pb-6">
              <div className="w-1/3">
                <div className="font-mono text-[var(--color-brand-cyan-light)] font-bold">{param.name}</div>
                <div className="text-xs text-gray-500 mt-1">{param.type}</div>
                {param.required && <div className="text-[10px] text-red-400 font-bold uppercase mt-1">Required</div>}
              </div>
              <div className="flex-1 text-sm text-gray-300">
                {param.description}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-4">
          <Key className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-yellow-500 mb-1">Authentication</h4>
            <p className="text-xs text-yellow-500/80">All API endpoints require a Bearer token. You can generate a token in the Trust Center under 'API Keys'.</p>
          </div>
        </div>
      </div>

      {/* Right Pane: Interactive Code & Response */}
      <div className="w-[450px] bg-[#0A0A0B] border-l border-white/10 flex flex-col hidden lg:flex">
        
        {/* Language Selector */}
        <div className="flex bg-[#111112] border-b border-white/10">
          {["cURL", "Python", "Go"].map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeLang === lang ? 'text-[var(--color-brand-cyan-light)] border-b-2 border-[var(--color-brand-cyan-light)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Code Snippet */}
        <div className="relative p-6 border-b border-white/10">
          <button onClick={handleCopy} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </button>
          <pre className="text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {getCodeSnippet(activeEndpoint.method, activeEndpoint.path, activeEndpoint.requestBody, activeLang)}
          </pre>
          
          <button 
            onClick={executeLive}
            disabled={isExecuting}
            className="mt-6 w-full py-3 bg-[var(--color-brand-cyan-dark)] hover:bg-[var(--color-brand-cyan-light)] text-white text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isExecuting ? (
              <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Executing...</span>
            ) : (
              <><Play className="w-4 h-4" /> Run Live Request</>
            )}
          </button>
        </div>

        {/* Response */}
        <div className="flex-1 bg-black p-6 overflow-y-auto relative">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Response</div>
          
          <AnimatePresence mode="wait">
            {!showLiveResponse ? (
              <motion.div key="example" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="absolute -top-10 right-0 px-2 py-1 bg-white/10 rounded text-[10px] text-gray-400 font-mono">Example</div>
                <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap">
                  {activeEndpoint.responseBody}
                </pre>
              </motion.div>
            ) : (
              <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <div className="absolute -top-10 right-0 px-2 py-1 bg-[var(--color-brand-emerald-dark)]/50 border border-[var(--color-brand-emerald-light)] rounded text-[10px] text-[var(--color-brand-emerald-light)] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--color-brand-emerald-light)] rounded-full animate-pulse" /> Live 200 OK
                </div>
                <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">
                  {activeEndpoint.responseBody}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
