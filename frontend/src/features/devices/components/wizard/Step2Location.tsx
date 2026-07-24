import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema } from "../../schemas/deviceSchema";
import { useProvisionWizard } from "../../contexts/ProvisionWizardContext";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { useLookupSites, useCollectors } from "../../hooks/useLookups";

export function Step2Location() {
  const { state, setStep, updateData } = useProvisionWizard();
  
  const form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      organization_id: state.data.organization_id || "",
      site_id: state.data.site_id || "",
      collector_id: state.data.collector_id || "",
    },
  });

  const selectedOrg = form.watch("organization_id");

  const { data: orgs, isLoading: loadingOrgs } = useOrganizations({ limit: 1000 });
  const { data: sites, isLoading: loadingSites } = useLookupSites(selectedOrg);
  const { data: collectors, isLoading: loadingCollectors } = useCollectors();

  const onSubmit = (data: any) => {
    updateData(data);
    setStep(3);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select onValueChange={(val) => {
                field.onChange(val);
                form.setValue("site_id", ""); // Reset site when org changes
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={loadingOrgs}>
                    <SelectValue placeholder={loadingOrgs ? "Loading..." : "Select organization"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {orgs?.data?.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger disabled={!selectedOrg || loadingSites}>
                    <SelectValue placeholder={!selectedOrg ? "Select organization first" : loadingSites ? "Loading..." : "Select site"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sites?.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="collector_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collector Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={loadingCollectors}>
                    <SelectValue placeholder={loadingCollectors ? "Loading..." : "Select collector"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collectors?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
          <Button type="submit">Next Step</Button>
        </div>
      </form>
    </Form>
  );
}
