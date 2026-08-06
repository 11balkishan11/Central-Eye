import { useState, useEffect } from "react";
import { AlertCircle, Target, Activity, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { apiClient } from "@/shared/api/client";

export function DriftPage() {
  const [findings, setFindings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<any[]>("/api/v1/findings");
      setFindings(data || []);
    } catch (err) {
      console.error("Failed to fetch findings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Policy Findings</h1>
          <p className="text-sm text-muted-foreground">Deviations detected by the Evaluation Engines.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {findings.map(finding => (
          <Card key={finding.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: finding.severity === 'CRITICAL' ? '#ef4444' : finding.severity === 'HIGH' ? '#f97316' : '#eab308' }}>
            <div className="flex p-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(finding.severity)} variant="outline">
                        {finding.severity}
                      </Badge>
                      <Badge variant="outline" className="bg-muted">
                        {finding.origin_engine}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(finding.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">Policy Violation on Resource</h3>
                    <p className="text-sm text-muted-foreground">Resource ID: <span className="font-mono text-xs">{finding.resource_id}</span></p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Target className="w-4 h-4 text-primary" />
                      Confidence Score
                    </div>
                    <div className="text-3xl font-bold text-primary mt-1">
                      {finding.confidence}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 font-medium mb-3 border-b pb-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      Evaluations
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <span>Failed Rules</span>
                        <Badge variant="destructive" className="rounded-full w-5 h-5 flex items-center justify-center p-0">{finding.evaluation_ids?.length || 1}</Badge>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 font-medium mb-3 border-b pb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Supporting Evidence
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{finding.evidence_count} evidence facts backing this finding.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {findings.length === 0 && !isLoading && (
          <div className="py-16 text-center border rounded-lg border-dashed">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500/50 mb-4" />
            <h3 className="text-xl font-medium">100% Compliant</h3>
            <p className="text-muted-foreground mt-2">No active policy violations or drift detected across your infrastructure.</p>
          </div>
        )}
      </div>
    </div>
  );
}
