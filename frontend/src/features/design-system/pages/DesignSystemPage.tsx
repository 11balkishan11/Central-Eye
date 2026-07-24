import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export function DesignSystemPage() {
  const [, setActiveTab] = useState("typography");

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground">Internal playground and documentation for reusable components.</p>
      </div>

      <Tabs defaultValue="typography" onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-16 z-20 bg-background pt-2 pb-4 border-b border-border mb-8">
          <TabsList className="flex flex-wrap h-auto overflow-x-auto justify-start">
            <TabsTrigger value="typography">Typography & Colors</TabsTrigger>
            <TabsTrigger value="buttons">Buttons & Badges</TabsTrigger>
            <TabsTrigger value="forms">Forms & Inputs</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & States</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="typography" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">Typography</h2>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <h3 className="text-2xl font-semibold">Heading 3</h3>
              <h4 className="text-xl font-medium">Heading 4</h4>
              <p className="text-base text-foreground">Paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p className="text-sm text-muted-foreground">Muted Text. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="buttons" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">Buttons</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button disabled>Disabled</Button>
              <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading</Button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">Badges</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="forms" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">Inputs & Controls</h2>
            <div className="grid grid-cols-2 gap-8 max-w-2xl">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Standard Input</label>
                <Input placeholder="Enter something..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Disabled Input</label>
                <Input disabled placeholder="Disabled..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Select Box</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">Enterprise States</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Empty State</h3>
                <div className="border border-border rounded-xl p-8 max-w-2xl bg-card">
                  <EmptyState 
                    title="No data found" 
                    description="Get started by creating a new entry."
                    icon={<FolderOpen size={24} />}
                    action={<Button>Create Entry</Button>}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Error State</h3>
                <div className="border border-border rounded-xl p-8 max-w-2xl bg-card">
                  <ErrorState 
                    title="Failed to load data" 
                    description="We couldn't load the necessary data for this component. Please try again."
                    retryAction={() => {}}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Toasts</h3>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => toast.success("Operation successful")}>Show Success Toast</Button>
                  <Button variant="outline" onClick={() => toast.error("Operation failed", { description: "An unknown error occurred." })}>Show Error Toast</Button>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
