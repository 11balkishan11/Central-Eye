import { useProvisionWizard } from "../../contexts/ProvisionWizardContext";
import { Step1Basics } from "./Step1Basics";
import { Step2Location } from "./Step2Location";
import { Step3Configuration } from "./Step3Configuration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeviceProvisionWizard({ open, onOpenChange }: Props) {
  const { state, reset } = useProvisionWizard();

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const handleComplete = () => {
    reset();
    onOpenChange(false);
  };

  const steps = [
    { title: "Basics", component: <Step1Basics /> },
    { title: "Location", component: <Step2Location /> },
    { title: "Configuration", component: <Step3Configuration onComplete={handleComplete} /> },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Provision Device</DialogTitle>
          <DialogDescription>
            Step {state.currentStep} of {steps.length}: {steps[state.currentStep - 1].title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-muted -z-10 -translate-y-1/2"></div>
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((state.currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center gap-2 bg-background px-2 ${
                state.currentStep > index + 1 ? "text-primary" : 
                state.currentStep === index + 1 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                state.currentStep > index + 1 ? "border-primary bg-primary text-primary-foreground" : 
                state.currentStep === index + 1 ? "border-primary bg-background text-primary" : "border-muted bg-background"
              }`}>
                {state.currentStep > index + 1 ? <CheckCircle2 size={16} /> : index + 1}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          {steps[state.currentStep - 1].component}
        </div>
      </DialogContent>
    </Dialog>
  );
}
