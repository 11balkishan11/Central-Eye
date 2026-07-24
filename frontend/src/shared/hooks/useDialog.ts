import { useState, useCallback } from "react";

export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);

  const open = useCallback((dialogData?: any) => {
    setIsOpen(true);
    if (dialogData) setData(dialogData);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle, data };
}
