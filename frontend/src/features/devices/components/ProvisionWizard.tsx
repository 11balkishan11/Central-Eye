import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { toast } from "sonner"
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { devicesApi } from "../services/devicesApi"
import type { ProvisionDeviceRequest } from "../services/devicesApi"
import { organizationsApi } from "@/features/organizations/services/organizationsApi"
import { sitesApi } from "@/features/sites/services/sitesApi"
import api from "@/shared/services/api/axios"

interface ProvisionWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProvisionWizard({ open, onOpenChange }: ProvisionWizardProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  
  // Form State
  const [formData, setFormData] = useState<Partial<ProvisionDeviceRequest>>({
    organization_id: "",
    site_id: "",
    hostname: "",
    management_ip: "",
    vendor: "",
    model: "",
    device_type: "switch",
    credential_profile_id: "",
    polling_profile_id: "",
    collector_id: "",
  })

  // Lookups
  const { data: orgs } = useQuery({
    queryKey: ["organizations", "lookup"],
    queryFn: () => organizationsApi.list(0, 100),
    enabled: open && step === 1
  })

  const { data: sites } = useQuery({
    queryKey: ["sites", "lookup", formData.organization_id],
    queryFn: () => sitesApi.list(formData.organization_id!, 0, 100),
    enabled: open && step === 1 && !!formData.organization_id
  })

  const { data: credentials } = useQuery({
    queryKey: ["lookups", "credentials"],
    queryFn: () => api.get("/api/v1/credential-profiles").then(res => res.data),
    enabled: open && step === 2
  })

  const { data: polling } = useQuery({
    queryKey: ["lookups", "polling"],
    queryFn: () => api.get("/api/v1/polling-profiles").then(res => res.data),
    enabled: open && step === 3
  })

  const { data: collectors } = useQuery({
    queryKey: ["lookups", "collectors"],
    queryFn: () => api.get("/api/v1/collectors").then(res => res.data),
    enabled: open && step === 4
  })

  const provisionMutation = useMutation({
    mutationFn: (data: ProvisionDeviceRequest) => devicesApi.provision(data),
    onSuccess: () => {
      toast.success("Device provisioning started")
      queryClient.invalidateQueries({ queryKey: ["devices"] })
      onOpenChange(false)
      // Reset state on success
      setTimeout(() => setStep(1), 500)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to provision device")
    }
  })

  const handleNext = () => setStep(s => Math.min(s + 1, 6))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 6) {
      handleNext()
    } else {
      provisionMutation.mutate(formData as ProvisionDeviceRequest)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organization *</Label>
              <Select 
                value={formData.organization_id} 
                onValueChange={(val) => setFormData({ ...formData, organization_id: val || "", site_id: "" })}
              >
                <SelectTrigger><SelectValue placeholder="Select Organization" /></SelectTrigger>
                <SelectContent>
                  {orgs?.items?.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Site *</Label>
              <Select 
                value={formData.site_id} 
                onValueChange={(val) => setFormData({ ...formData, site_id: val || "" })}
                disabled={!formData.organization_id}
              >
                <SelectTrigger><SelectValue placeholder="Select Site" /></SelectTrigger>
                <SelectContent>
                  {sites?.items?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hostname *</Label>
                <Input value={formData.hostname} onChange={e => setFormData({...formData, hostname: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Management IP *</Label>
                <Input value={formData.management_ip} onChange={e => setFormData({...formData, management_ip: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Input value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} placeholder="e.g. Cisco" />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="e.g. C9200L" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.device_type} onValueChange={(val) => setFormData({ ...formData, device_type: val || "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="switch">Switch</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="firewall">Firewall</SelectItem>
                    <SelectItem value="wireless">Wireless</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 py-4">
            <Label>Credential Profile</Label>
            <p className="text-sm text-muted-foreground mb-4">Select the authentication profile used to access this device.</p>
            <Select value={formData.credential_profile_id} onValueChange={(val) => setFormData({ ...formData, credential_profile_id: val || "" })}>
              <SelectTrigger><SelectValue placeholder="Select Credential Profile" /></SelectTrigger>
              <SelectContent>
                {credentials?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 py-4">
            <Label>Polling Profile</Label>
            <p className="text-sm text-muted-foreground mb-4">Determine how often metrics are collected from this device.</p>
            <Select value={formData.polling_profile_id} onValueChange={(val) => setFormData({ ...formData, polling_profile_id: val || "" })}>
              <SelectTrigger><SelectValue placeholder="Select Polling Profile" /></SelectTrigger>
              <SelectContent>
                {polling?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4 py-4">
            <Label>Collector</Label>
            <p className="text-sm text-muted-foreground mb-4">Assign a specific collector to monitor this device.</p>
            <Select value={formData.collector_id} onValueChange={(val) => setFormData({ ...formData, collector_id: val || "" })}>
              <SelectTrigger><SelectValue placeholder="Select Collector" /></SelectTrigger>
              <SelectContent>
                {collectors?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4 py-4">
            <Label>Tags (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-4">Add metadata tags to help organize your devices.</p>
            <div className="bg-muted p-4 rounded-md text-sm text-center border border-dashed border-border text-muted-foreground">
              Tag editor component placeholder.
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4 py-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <CheckCircle2 className="text-green-500 h-5 w-5" /> Ready to Provision
            </h3>
            <p className="text-sm text-muted-foreground">
              The device <strong>{formData.hostname}</strong> ({formData.management_ip}) will be provisioned.
              The system will attempt to connect, discover its capabilities, and begin polling.
            </p>
            <div className="bg-muted p-4 rounded-md border mt-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Hostname</dt>
                <dd className="font-medium text-right">{formData.hostname}</dd>
                <dt className="text-muted-foreground">IP Address</dt>
                <dd className="font-medium text-right">{formData.management_ip}</dd>
                <dt className="text-muted-foreground">Vendor</dt>
                <dd className="font-medium text-right">{formData.vendor || "-"}</dd>
              </dl>
            </div>
          </div>
        )
    }
  }

  const isStepValid = () => {
    if (step === 1) return !!formData.organization_id && !!formData.site_id && !!formData.hostname && !!formData.management_ip
    // Other steps are optional for now based on backend schema, but let's encourage selection
    return true
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!v) { setStep(1); onOpenChange(false); } }}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Provision Device</DialogTitle>
            <DialogDescription>
              Step {step} of 6
            </DialogDescription>
            {/* Progress Bar */}
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </DialogHeader>

          <div className="py-4 min-h-[300px]">
            {renderStep()}
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePrev}
              disabled={step === 1 || provisionMutation.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {step < 6 ? (
              <Button type="submit" disabled={!isStepValid()}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={provisionMutation.isPending || !isStepValid()}>
                {provisionMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Provisioning...</>
                ) : (
                  "Provision Device"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
