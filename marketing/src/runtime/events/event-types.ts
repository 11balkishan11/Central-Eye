export type EventType =
  | 'APP_INITIALIZED'
  | 'PERSONA_CHANGED'
  | 'WORKSPACE_OPENED'
  | 'SIMULATION_TICK'
  | 'TIME_STATE_CHANGED'
  | 'NODE_DISCOVERED'
  | 'ALERT_TRIGGERED'
  | 'AI_REQUESTED'
  | 'AI_RESPONDED'
  | 'MISSION_STARTED'
  | 'MISSION_STEP_COMPLETED'
  | 'EXECUTE_API_REQUEST'
  | 'API_RESPONSE_RECEIVED'
  | 'TOPOLOGY_UPDATED'
  | 'PRICING_UPDATED';

export interface RuntimeEvent<P = any> {
  id: string;
  type: EventType;
  timestamp: number;
  payload: P;
  source?: string;
}

export type EventListener = (event: RuntimeEvent) => void;
