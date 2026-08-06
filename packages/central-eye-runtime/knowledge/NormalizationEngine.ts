import { RuntimeContext } from '../runtime/RuntimeContext';

/**
 * Normalization Engine
 * 
 * Takes raw unstructured or multi-vendor telemetry (e.g. Cisco vs Palo Alto logs)
 * and normalizes it into a standard internal format before passing it to the Graph.
 */
export class NormalizationEngine {
  private ctx: RuntimeContext;

  constructor(ctx: RuntimeContext) {
    this.ctx = ctx;
  }

  public normalize(rawPayload: any): Record<string, any> {
    // Example: Map vendor-specific severity to internal status
    let status = 'unknown';
    if (rawPayload.severity === 'CRITICAL' || rawPayload.status === 'down') {
      status = 'offline';
    } else if (rawPayload.severity === 'WARN' || rawPayload.cpu > 80) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      vendor: rawPayload.vendor || 'Unknown',
      ip: rawPayload.ipAddress || rawPayload.ip,
    };
  }
}
