from enum import Enum

class PlatformEventType(str, Enum):
    """
    Frozen Event Taxonomy.
    Once defined, these strings must never be renamed as they are persisted 
    immutably in the PlatformEvent store and used for historical querying.
    """
    
    # Observation Lifecycle
    OBSERVATION_CREATED = "ObservationCreated"
    OBSERVATION_EXPIRED = "ObservationExpired"
    
    # Fact Lifecycle
    FACT_UPDATED = "FactUpdated"
    FACT_REMOVED = "FactRemoved"
    
    # Topology Lifecycle
    RESOURCE_CREATED = "ResourceCreated"
    RESOURCE_STATE_CHANGED = "ResourceStateChanged"
    RELATIONSHIP_CREATED = "RelationshipCreated"
    RELATIONSHIP_REMOVED = "RelationshipRemoved"
    
    # Policy Lifecycle
    POLICY_ASSIGNED = "PolicyAssigned"
    POLICY_UNASSIGNED = "PolicyUnassigned"
    
    # Evaluation Lifecycle
    EVALUATION_STARTED = "EvaluationStarted"
    EVALUATION_COMPLETED = "EvaluationCompleted"
    
    # Finding Lifecycle
    FINDING_OPENED = "FindingOpened"
    FINDING_RESOLVED = "FindingResolved"
    FINDING_ACKNOWLEDGED = "FindingAcknowledged"
    
    # Incident Lifecycle
    INCIDENT_OPENED = "IncidentOpened"
    INCIDENT_MERGED = "IncidentMerged"
    INCIDENT_RESOLVED = "IncidentResolved"
    INCIDENT_CLOSED = "IncidentClosed"
    
    # Automation Lifecycle (Future)
    WORKFLOW_STARTED = "WorkflowStarted"
    WORKFLOW_COMPLETED = "WorkflowCompleted"
