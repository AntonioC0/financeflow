import { usePreferences } from "@/contexts/PreferencesContext";

interface CurrencyProps {
  value: number;
  className?: string;
}

export function Currency({ value, className }: CurrencyProps) {
  const { formatCurrency } = usePreferences();
  
  return <span className={className}>{formatCurrency(value)}</span>;
}
