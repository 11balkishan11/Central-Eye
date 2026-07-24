import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { DeviceFormData } from "../schemas/deviceSchema"; // Will create this next

interface ProvisionWizardState {
  currentStep: number;
  data: Partial<DeviceFormData>;
}

interface ProvisionWizardContextType {
  state: ProvisionWizardState;
  setStep: (step: number) => void;
  updateData: (data: Partial<DeviceFormData>) => void;
  reset: () => void;
}

const initialState: ProvisionWizardState = {
  currentStep: 1,
  data: {},
};

const ProvisionWizardContext = createContext<ProvisionWizardContextType | undefined>(undefined);

export function ProvisionWizardProvider({ children }: { children: ReactNode }) {
  const [state, setState, removeState] = useLocalStorage<ProvisionWizardState>(
    "ns3_provision_wizard_state",
    initialState
  );

  const setStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const updateData = (newData: Partial<DeviceFormData>) => {
    setState((prev) => ({ ...prev, data: { ...prev.data, ...newData } }));
  };

  const reset = () => {
    removeState();
  };

  return (
    <ProvisionWizardContext.Provider value={{ state, setStep, updateData, reset }}>
      {children}
    </ProvisionWizardContext.Provider>
  );
}

export function useProvisionWizard() {
  const context = useContext(ProvisionWizardContext);
  if (context === undefined) {
    throw new Error("useProvisionWizard must be used within a ProvisionWizardProvider");
  }
  return context;
}
