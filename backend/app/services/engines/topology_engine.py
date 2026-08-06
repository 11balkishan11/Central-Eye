import time
from typing import Dict, Any, List, Optional
from app.models.resource import Resource
from app.services.engines.base_engine import BaseEngine, EvaluationResult, EvaluationRequest
from app.services.engines.engine_registry import EngineRegistry, EngineMetadata
from app.services.operator_registry import OperatorRegistry

class TopologyEngine(BaseEngine):
    engine_name = "TopologyEngine"
    engine_version = "1.0"
    
    def evaluate(self, request: EvaluationRequest) -> EvaluationResult:
        start_time = time.time()
        
        resource = request.resource
        policy_version = request.policy_version
        synthetic_facts = request.context.synthetic_facts
        
        rules = policy_version.rule_schema.get("rules", [])
        if not rules:
            return EvaluationResult(status="NOT_APPLICABLE", trace={}, evidence_facts=[], metrics={"duration_ms": int((time.time() - start_time) * 1000)})
        
        attributes = {}
        if synthetic_facts is not None:
            attributes = synthetic_facts
        else:
            if not resource or not resource.states:
                duration = int((time.time() - start_time) * 1000)
                trace = self._build_trace("UNKNOWN", resource, duration, [], rules, request.context.timestamp, unknown_reason="Resource has no state data to evaluate.")
                return EvaluationResult(status="UNKNOWN", trace=trace, evidence_facts=[], metrics={"duration_ms": duration})
                
            latest_state = resource.states[-1]
            attributes = latest_state.attributes
        
        status = "PASS"
        rule_traces = []
        passed_count = 0
        failed_count = 0
        
        for rule in rules:
            rule_id = rule.get("id", "unknown")
            attribute = rule.get("attribute")
            operator = rule.get("operator")
            expected_value = rule.get("value")
            
            actual_value = attributes.get(attribute)
            
            if actual_value is None and operator != "exists":
                rule_traces.append({
                    "rule_id": rule_id,
                    "attribute": attribute,
                    "operator": operator,
                    "expected": expected_value,
                    "actual": None,
                    "result": "UNKNOWN",
                    "message": f"Topology attribute '{attribute}' not found.",
                    "evidence": []
                })
                status = "UNKNOWN"
                break
                
            passed = OperatorRegistry.evaluate(operator, actual_value, expected_value)
            
            rule_result = "PASS" if passed else "FAIL"
            
            if passed:
                passed_count += 1
                message = f"Topology rule passed: {attribute} {operator} {expected_value}"
            else:
                failed_count += 1
                message = f"Topology violation: Expected {attribute} {operator} {expected_value}, but was {actual_value}"
                status = "FAIL"
                
            rule_traces.append({
                "rule_id": rule_id,
                "attribute": attribute,
                "operator": operator,
                "expected": expected_value,
                "actual": actual_value,
                "result": rule_result,
                "message": message,
                "evidence": []
            })
            
            if not passed:
                break
                
        duration = int((time.time() - start_time) * 1000)
        trace = self._build_trace(status, resource, duration, rule_traces, rules, request.context.timestamp)
        return EvaluationResult(status=status, trace=trace, evidence_facts=[], metrics={"duration_ms": duration})
        
    def _build_trace(self, status: str, resource: Optional[Resource], duration: int, rule_traces: List[Dict], all_rules: List[Dict], timestamp, unknown_reason: str = None) -> Dict[str, Any]:
        trace = {
            "trace_schema_version": "1.0",
            "engine": {
                "name": self.engine_name,
                "version": self.engine_version,
                "duration_ms": duration
            },
            "resource": {
                "id": str(resource.id) if resource else "synthetic",
                "snapshot_timestamp": timestamp.isoformat() if timestamp else None
            },
            "summary": {
                "status": status,
                "rules": len(all_rules),
                "passed": sum(1 for r in rule_traces if r["result"] == "PASS"),
                "failed": sum(1 for r in rule_traces if r["result"] == "FAIL")
            },
            "rules": rule_traces
        }
        
        if unknown_reason:
            trace["unknown_reason"] = unknown_reason
            
        return trace

EngineRegistry.register(
    TopologyEngine(), 
    EngineMetadata(
        id="topology",
        display_name="Topology Engine",
        description="Evaluates the physical and logical relationships, connections, and structural paths in the infrastructure.",
        version="1.0",
        supported_operators=["equals", "less_than", "greater_than", "exists"],
        supported_resources=["network_device"],
        documentation="Validates redundancies, required neighbors, and critical paths.",
        examples=["redundant_links greater_than 1"]
    )
)
