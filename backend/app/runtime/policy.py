from app.runtime.context import RuntimeContext
from app.runtime.config import ConfigurationService

class RuntimePolicyEngine:
    """
    Governs the execution of the entire Runtime Platform Layer.
    Enforces quotas, rate limits, maintenance windows, and automation freezes.
    All runtime components (JobQueue, API) must consult this engine before executing work.
    """
    
    @classmethod
    def can_enqueue_job(cls, context: RuntimeContext, job_type: str) -> bool:
        """
        Example policy: Prevents enqueuing jobs if tenant quota is exceeded or automation is frozen.
        """
        # 1. Check Automation Freeze
        is_frozen = ConfigurationService.get("runtime.automation.freeze", False)
        if is_frozen and job_type == "automation":
            return False
            
        # 2. Check Tenant Quotas (Mocked)
        max_jobs = ConfigurationService.get("runtime.tenant.max_concurrent_jobs", 100)
        # In a real system, query MetricsProvider for current active jobs for context.tenant_id
        active_jobs = 0 
        if active_jobs >= max_jobs:
            return False
            
        return True
        
    @classmethod
    def can_execute_api(cls, context: RuntimeContext, endpoint: str) -> bool:
        """
        Example policy: API Rate limits per tenant.
        """
        _ = ConfigurationService.get("runtime.tenant.api_rate_limit", 1000)
        return True
        
    @classmethod
    def get_budget(cls, context: RuntimeContext, resource: str) -> int:
        """
        Example policy: Token budgets for AI, Storage quotas, etc.
        """
        if resource == "llm_tokens":
            return ConfigurationService.get("runtime.tenant.ai_token_budget", 1000000)
        return -1
