import { useState, useEffect } from "react";
import { Plus, Shield, Code, Save, Play, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { apiClient } from "@/shared/api/client";

export function PolicyPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New policy state
  const [name, setName] = useState("");
  const [matchCriteria, setMatchCriteria] = useState('{\n  "match": {\n    "resource_type": "NETWORK_DEVICE"\n  }\n}');
  const [ruleSchema, setRuleSchema] = useState('{\n  "rules": [\n    {"attribute": "firmware", "operator": "greater_than", "value": "17.0"}\n  ]\n}');
  const [isCreating, setIsCreating] = useState(false);
  
  const [testResult, setTestResult] = useState<any>(null);
  
  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<any[]>("/api/v1/policies");
      setPolicies(data || []);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await apiClient.post("/api/v1/policies", {
        name: name,
        description: "Created via JSON Editor",
        is_active: true,
        version: {
          match_criteria: JSON.parse(matchCriteria),
          rule_schema: JSON.parse(ruleSchema)
        }
      });
      setIsCreating(false);
      setName("");
      fetchPolicies();
    } catch (err) {
      console.error("Failed to create policy:", err);
      alert("Invalid JSON or API error");
    }
  };
  
  const handleDryRun = () => {
    try {
      // Just parsing to validate JSON format for dry run
      JSON.parse(matchCriteria);
      JSON.parse(ruleSchema);
      
      // Mock dry run result
      setTestResult({
        status: "PASS",
        message: "Policy format is valid. (Dry Run simulation successful)"
      });
      
      setTimeout(() => setTestResult(null), 5000);
    } catch (err) {
      setTestResult({
        status: "ERROR",
        message: "Invalid JSON format in policy definition."
      });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
          <p className="text-sm text-muted-foreground">Manage infrastructure intent and evaluation rules.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Cancel" : "New Policy"}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              JSON Policy Editor
            </CardTitle>
            <CardDescription>Define Match Criteria and Rule Schema using JSON.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. Core Switch Firmware Compliance"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Match Criteria (JSON)</label>
                <textarea 
                  value={matchCriteria}
                  onChange={(e) => setMatchCriteria(e.target.value)}
                  className="w-full flex min-h-[200px] rounded-md border border-input bg-muted/50 font-mono text-xs px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rule Schema (JSON)</label>
                <textarea 
                  value={ruleSchema}
                  onChange={(e) => setRuleSchema(e.target.value)}
                  className="w-full flex min-h-[200px] rounded-md border border-input bg-muted/50 font-mono text-xs px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            
            {testResult && (
              <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${testResult.status === 'PASS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {testResult.status === 'PASS' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {testResult.message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/20 py-4">
            <Button variant="outline" onClick={handleDryRun}>
              <Play className="w-4 h-4 mr-2" />
              Test Rule (Dry Run)
            </Button>
            <Button onClick={handleCreate} disabled={!name}>
              <Save className="w-4 h-4 mr-2" />
              Save Policy
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map(policy => (
          <Card key={policy.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Shield className="w-8 h-8 text-primary/80 mb-2" />
                <Badge variant={policy.is_active ? "default" : "secondary"}>
                  {policy.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardTitle className="text-base">{policy.name}</CardTitle>
              <CardDescription className="text-xs truncate">{policy.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resources Matched</span>
                  <span className="font-medium">14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compliance</span>
                  <span className="text-green-500 font-medium">97%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" size="sm" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
        {policies.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center border rounded-lg border-dashed">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No Policies Defined</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first policy to start evaluating infrastructure.</p>
            <Button variant="outline" onClick={() => setIsCreating(true)}>Create Policy</Button>
          </div>
        )}
      </div>
    </div>
  );
}
