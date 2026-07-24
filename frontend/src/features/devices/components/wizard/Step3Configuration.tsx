import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step3Schema } from "../../schemas/deviceSchema";
import { useProvisionWizard } from "../../contexts/ProvisionWizardContext";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useDeviceGroups, useCredentialProfiles, usePollingProfiles } from "../../hooks/useLookups";
import { useCreateDevice } from "../../hooks/useDevices";
import { Loader2 } from "lucide-react";

export function Step3Configuration({ onComplete }: { onComplete: () => void }) {
  const { state, setStep } = useProvisionWizard();
  const createMutation = useCreateDevice();
  
  const form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      device_group_id: state.data.device_group_id || "",
      credential_profile_id: state.data.credential_profile_id || "",
      polling_profile_id: state.data.polling_profile_id || "",
    },
  });

  const { data: groups, isLoading: loadingGroups } = useDeviceGroups();
  const { data: credentials, isLoading: loadingCreds } = useCredentialProfiles();
  const { data: polling, isLoading: loadingPolling } = usePollingProfiles();

  const onSubmit = (data: any) => {
    // Backend only provisions base device right now. (Option B)
    const finalPayload = {
      site_id: state.data.site_id,
      group_id: data.device_group_id,
      hostname: state.data.hostname,
      management_ip: state.data.management_ip,
    };
    
    createMutation.mutate(finalPayload, {
      onSuccess: () => {
        onComplete();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-4 rounded-md border border-blue-500/20 text-sm mb-6">
          <strong>Note:</strong> Configuration will be applied during discovery.
        </div>

        <FormField
          control={form.control}
          name="device_group_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={loadingGroups}>
                    <SelectValue placeholder={loadingGroups ? "Loading..." : "Select group"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups?.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credential_profile_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credential Profile</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={loadingCreds}>
                    <SelectValue placeholder={loadingCreds ? "Loading..." : "Select credentials"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {credentials?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="polling_profile_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Polling Profile</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={loadingPolling}>
                    <SelectValue placeholder={loadingPolling ? "Loading..." : "Select polling profile"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {polling?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Provision Device
          </Button>
        </div>
      </form>
    </Form>
  );
}
