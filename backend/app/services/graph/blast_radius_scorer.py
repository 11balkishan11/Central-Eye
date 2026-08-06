from typing import List, Dict, Any
from app.models.resource import Resource

class BlastRadiusScorer:
    """
    Answers: How severe is the impact?
    Scores the final impact based on the rich metadata of impacted resources.
    """
    
    def score_impact(self, impacted_resources: List[Resource]) -> Dict[str, Any]:
        """
        Calculates a qualitative severity score and explains the reason.
        """
        score = "LOW"
        reason = "No critical resources impacted."
        
        highest_importance = 0
        gold_services_count = 0
        production_count = 0
        critical_tags_count = 0
        impacted_teams = set()
        
        for res in impacted_resources:
            if res.importance and res.importance > highest_importance:
                highest_importance = res.importance
                
            if res.sla_tier and res.sla_tier.lower() == "gold":
                gold_services_count += 1
                
            if res.environment and res.environment.lower() == "production":
                production_count += 1
                
            if res.tags and "Critical" in res.tags:
                critical_tags_count += 1
                
            if res.owner_team:
                impacted_teams.add(res.owner_team)
                
        # Simple scoring rules for MVP
        if gold_services_count > 0 or critical_tags_count > 0 or highest_importance >= 90:
            score = "CRITICAL"
            reason = f"{gold_services_count} Gold services, {critical_tags_count} Critical tags, {production_count} Production systems impacted across {len(impacted_teams)} teams."
        elif production_count > 0 or highest_importance >= 50:
            score = "HIGH"
            reason = f"{production_count} Production systems impacted."
        elif len(impacted_resources) > 5:
            score = "MEDIUM"
            reason = f"{len(impacted_resources)} total systems impacted."
            
        return {
            "score": score,
            "reason": reason,
            "metrics": {
                "impacted_count": len(impacted_resources),
                "gold_services_count": gold_services_count,
                "production_count": production_count,
                "teams_impacted": list(impacted_teams)
            }
        }
