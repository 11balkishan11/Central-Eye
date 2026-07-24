import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema } from "../../schemas/deviceSchema";
import { useProvisionWizard } from "../../contexts/ProvisionWizardContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useVendors } from "../../hooks/useLookups";

export function Step1Basics() {
  const { state, setStep, updateData } = useProvisionWizard();
  const { data: vendors, isLoading } = useVendors();

  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      hostname: state.data.hostname || "",
      management_ip: state.data.management_ip || "",
      vendor: state.data.vendor || "",
      model: state.data.model || "",
    },
  });

  const onSubmit = (data: any) => {
    updateData(data);
    setStep(2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hostname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hostname</FormLabel>
                <FormControl>
                  <Input placeholder="router-01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="management_ip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Management IP</FormLabel>
                <FormControl>
                  <Input placeholder="192.168.1.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isLoading}>
                      <SelectValue placeholder={isLoading ? "Loading..." : "Select vendor"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendors?.map(v => (
                      <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Catalyst 9300" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">Next Step</Button>
        </div>
      </form>
    </Form>
  );
}
