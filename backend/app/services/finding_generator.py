from sqlalchemy.orm import Session
from app.models.finding import PolicyEvaluation, Finding, FindingState

class FindingGenerator:
    def __init__(self, db: Session):
        self.db = db

    def process_evaluation(self, evaluation: PolicyEvaluation):
        """Processes a single evaluation and updates/creates findings."""
        if evaluation.status == "FAIL":
            # Check if there is an existing OPEN finding for this resource and engine.
            # In a more complex setup, findings might be grouped by intent/policy. 
            # For Sprint 1 Minimal Slice, let's group by resource_id + engine_name.
            finding = self.db.query(Finding).filter(
                Finding.resource_id == evaluation.resource_id,
                Finding.origin_engine == evaluation.engine_name,
                Finding.status == "OPEN"
            ).first()
            
            if not finding:
                finding = Finding(
                    tenant_id=evaluation.resource.tenant_id,
                    resource_id=evaluation.resource_id,
                    origin_engine=evaluation.engine_name,
                    severity="MEDIUM", # Default for sprint 1
                    status="OPEN"
                )
                self.db.add(finding)
                self.db.flush()
                
                # Create state
                state = FindingState(
                    finding_id=finding.id,
                    status="OPEN"
                )
                self.db.add(state)
                
            # Link evaluation to finding
            evaluation.finding_id = finding.id
            self.db.add(evaluation)
            self.db.commit()
            
        elif evaluation.status == "PASS":
            # If there was a finding open for this, and now it passes, we could resolve it.
            # However, a finding might consist of multiple evaluations. If ALL evaluations pass, resolve finding.
            # For sprint 1 minimal slice, just leave this stubbed. The user said: 
            # "Prove the core flow: Collector -> Observation -> Facts -> Configuration Engine -> Policy Evaluation -> Finding -> GET /findings"
            pass
