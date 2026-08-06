from sqlalchemy.orm import Session
from typing import Tuple, List, Dict, Any, Optional
import networkx as nx

from app.services.queries.registry import query
from app.services.queries.schema import QueryRequestV1, QueryContext
from app.models.projections import TopologyProjectionModel

@query(name="TopologyQuery", ttl=60, cost="high", paginated=False, permissions=["topology:read"])
class TopologyQueryHandler:
    
    def execute(self, request: QueryRequestV1, context: QueryContext, db: Session) -> Tuple[List[Dict[str, Any]], Dict[str, Any], Optional[str]]:
        topology_id = "master_topology"
        
        # In MVP we only fetch the entire topology for the tenant
        model = db.query(TopologyProjectionModel).filter(
            TopologyProjectionModel.topology_id == topology_id,
            TopologyProjectionModel.tenant_id == context.tenant_id
        ).first()
        
        if not model:
            return [], {}, None
            
        # Build NetworkX graph
        G = nx.Graph()
        for node in model.nodes:
            G.add_node(node["id"], **node)
            
        for link in model.links:
            # We assume bidirectional links for this MVP visualization
            G.add_edge(link["source"], link["target"], **link)
            
        # Process graph queries from parameters
        params = request.parameters or {}
        operation = params.get("operation", "subgraph")
        
        if operation == "subgraph":
            # Just return everything
            return self._format_graph(G), {}, None
            
        elif operation == "neighbors":
            node_id = params.get("node_id")
            if not node_id or node_id not in G:
                return [], {"error": f"Node {node_id} not found"}, None
                
            neighbors = list(G.neighbors(node_id))
            # Include the origin node as well
            neighbors.append(node_id)
            subgraph = G.subgraph(neighbors)
            return self._format_graph(subgraph), {}, None
            
        elif operation == "path":
            source = params.get("source")
            target = params.get("target")
            if not source or not target or source not in G or target not in G:
                return [], {"error": "Invalid source or target"}, None
                
            try:
                path = nx.shortest_path(G, source=source, target=target)
                subgraph = G.subgraph(path)
                return self._format_graph(subgraph), {"path_length": len(path)}, None
            except nx.NetworkXNoPath:
                return [], {"error": "No path found"}, None
                
        elif operation == "radius":
            node_id = params.get("node_id")
            radius = params.get("radius", 1)
            if not node_id or node_id not in G:
                return [], {"error": f"Node {node_id} not found"}, None
                
            # Get nodes within N hops
            lengths = nx.single_source_shortest_path_length(G, node_id, cutoff=radius)
            subgraph = G.subgraph(lengths.keys())
            return self._format_graph(subgraph), {}, None
            
        return self._format_graph(G), {}, None
        
    def _format_graph(self, G: nx.Graph) -> List[Dict[str, Any]]:
        # Format for D3.js or similar UI graph libraries
        return {
            "nodes": [{"id": n, **d} for n, d in G.nodes(data=True)],
            "links": [{"source": u, "target": v, **d} for u, v, d in G.edges(data=True)]
        }
