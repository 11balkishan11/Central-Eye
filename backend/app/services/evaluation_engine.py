import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi.concurrency import run_in_threadpool

from app.models.policy import PolicyVersion, PolicyAssignment
from app.models.resource import Resource
from app.models.finding import PolicyEvaluation, Evidence
from app.services.engines.base_engine import EvaluationResult, EvaluationRequest, EvaluationContext
from app.services.engines.engine_registry import EngineRegistry
from app.services.metrics_service import MetricsService
from app.services.events.event_publisher import EventPublisher
from app.services.events.taxonomy import PlatformEventType
from app.services.context.context_assembler import ContextAssembler

class EvaluationOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.event_publisher = EventPublisher(db)
        self.context_assembler = ContextAssembler(db)

    async def evaluate_assignments(
        self, 
        assignments: List[PolicyAssignment], 
        trigger: str = "SCHEDULED"
    ) -> List[PolicyEvaluation]:
        """
        Evaluate a list of assignments in parallel across engines.
        """
        timestamp = datetime.now(timezone.utc)
        
        # Build requests
        requests = []
        for assignment in assignments:
            engine = EngineRegistry.get_engine(assignment.policy.versions[-1].engine if assignment.policy.versions else "configuration")
            if not engine:
                continue
                infra_context = self.context_assembler.build(assignment.resource_id)
            
            req = EvaluationRequest(
                resource=assignment.resource,
                facts=infra_context.facts,
                policy_version=assignment.policy.versions[-1],
                context=EvaluationContext(
                    trigger=trigger,
                    timestamp=timestamp,
                    neighbors=infra_context.graph_neighbors,
                    upstream=infra_context.upstream_dependencies,
                    downstream=infra_context.downstream_dependencies,
                    dependency_tree=infra_context.dependency_tree,
                    graph_snapshot=infra_context.graph_snapshot,
                    recent_history=infra_context.recent_history,
                    active_findings=infra_context.active_findings,
                    policies=infra_context.policies,
                    metadata=infra_context.metadata
                )
            )
            requests.append((engine, req))

        # Execute concurrently
        async def _run_engine(engine, req):
            self.event_publisher.publish(
                PlatformEventType.EVALUATION_STARTED,
                "Resource",
                req.resource.id,
                {"policy_id": str(req.policy_version.policy_id)}
            )
            result = await run_in_threadpool(engine.evaluate, req)
            return (req, engine, result)

        results = await asyncio.gather(*[_run_engine(engine, req) for engine, req in requests])
        
        # Save results and emit finished events
        evaluations = []
        for req, engine, result in results:
            db_eval = PolicyEvaluation(
                policy_version_id=req.policy_version.id,
                resource_id=req.resource.id,
                status=result.status,
                engine_name=engine.engine_name,
                engine_version=engine.engine_version,
                trigger=req.context.trigger,
                evaluation_duration_ms=result.metrics.get("duration_ms", 0),
                trace=result.trace,
                started_at=req.context.timestamp,
                finished_at=datetime.now(timezone.utc)
            )
            self.db.add(db_eval)
            self.db.flush()
            
            for fact in result.evidence_facts:
                ev = Evidence(
                    evaluation_id=db_eval.id,
                    fact_id=fact.id,
                    source=fact.category,
                    weight=10
                )
                self.db.add(ev)
            
            evaluations.append(db_eval)
            
            rules_count = len(result.trace.get("rules", [])) if result.trace else 0
            MetricsService.record_evaluation(rules_count, result.metrics.get("duration_ms", 0), result.status)
            self.event_publisher.publish(
                PlatformEventType.EVALUATION_COMPLETED,
                "PolicyEvaluation",
                db_eval.id,
                {"status": result.status}
            )

        self.db.commit()
        
        # Notify finding generator
        # from app.services.finding_generator import FindingGenerator
        # FindingGenerator(self.db).process_evaluations(evaluations)
        
        return evaluations

    def evaluate_resource_sync(
        self, 
        resource: Optional[Resource], 
        policy_version: PolicyVersion, 
        synthetic_facts: Optional[Dict[str, Any]] = None,
        dry_run: bool = False,
        trigger: str = "TEST_RUNNER"
    ) -> PolicyEvaluation:
        """
        Synchronous evaluation used primarily for dry_run test API.
        """
        timestamp = datetime.now(timezone.utc)
        engine_id = policy_version.engine or "configuration"
        engine = EngineRegistry.get_engine(engine_id)
        if not engine:
            raise ValueError(f"Engine {engine_id} not found in registry")
            
        req = EvaluationRequest(
            resource=resource,
            policy_version=policy_version,
            context=EvaluationContext(
                trigger=trigger,
                timestamp=timestamp,
                synthetic_facts=synthetic_facts
            )
        )
        
        result: EvaluationResult = engine.evaluate(req)
        
        db_eval = PolicyEvaluation(
            policy_version_id=policy_version.id,
            resource_id=resource.id if resource else None,
            status=result.status,
            engine_name=engine.engine_name,
            engine_version=engine.engine_version,
            trigger=trigger,
            evaluation_duration_ms=result.metrics.get("duration_ms", 0),
            trace=result.trace,
            started_at=timestamp,
            finished_at=datetime.now(timezone.utc)
        )
        
        if dry_run:
            return db_eval

        self.db.add(db_eval)
        self.db.flush()
        
        for fact in result.evidence_facts:
            ev = Evidence(
                evaluation_id=db_eval.id,
                fact_id=fact.id,
                source=fact.category,
                weight=10
            )
            self.db.add(ev)
            
        self.db.commit()
        self.db.refresh(db_eval)
        return db_eval
