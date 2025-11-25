import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface Preferences {
  currency: string;
  language: string;
  dateFormat: string;
}

interface PreferencesContextType {
  preferences: Preferences;
  isLoading: boolean;
  updateCurrency: (currency: string) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  updateDateFormat: (dateFormat: string) => Promise<void>;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | string) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<string, { symbol: string; code: string }> = {
  "BRL": { symbol: "R$", code: "BRL" },
  "USD": { symbol: "$", code: "USD" },
  "EUR": { symbol: "€", code: "EUR" },
  "GBP": { symbol: "£", code: "GBP" },
  "JPY": { symbol: "¥", code: "JPY" },
  "CNY": { symbol: "¥", code: "CNY" },
  "AUD": { symbol: "A$", code: "AUD" },
  "CAD": { symbol: "C$", code: "CAD" },
  "CHF": { symbol: "CHF", code: "CHF" },
  "ARS": { symbol: "$", code: "ARS" },
  "MXN": { symbol: "$", code: "MXN" },
  "CLP": { symbol: "$", code: "CLP" },
  "COP": { symbol: "$", code: "COP" },
  "PEN": { symbol: "S/", code: "PEN" },
  "UYU": { symbol: "$U", code: "UYU" },
  "INR": { symbol: "₹", code: "INR" },
  "KRW": { symbol: "₩", code: "KRW" },
  "RUB": { symbol: "₽", code: "RUB" },
  "ZAR": { symbol: "R", code: "ZAR" },
  "TRY": { symbol: "₺", code: "TRY" },
  "NZD": { symbol: "NZ$", code: "NZD" },
  "SGD": { symbol: "S$", code: "SGD" },
  "HKD": { symbol: "HK$", code: "HKD" },
  "SEK": { symbol: "kr", code: "SEK" },
  "NOK": { symbol: "kr", code: "NOK" },
  "DKK": { symbol: "kr", code: "DKK" },
  "PLN": { symbol: "zł", code: "PLN" },
  "THB": { symbol: "฿", code: "THB" },
  "MYR": { symbol: "RM", code: "MYR" },
  "IDR": { symbol: "Rp", code: "IDR" },
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({
    currency: "BRL",
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
  });

  const { data: userSettings, isLoading } = trpc.userSettings.get.useQuery();
  const updateSettingsMutation = trpc.userSettings.update.useMutation();

  useEffect(() => {
    if (userSettings) {
      setPreferences({
        currency: userSettings.currency || "BRL",
        language: userSettings.language || "pt-BR",
        dateFormat: userSettings.dateFormat || "DD/MM/YYYY",
      });
    }
  }, [userSettings]);

  const updateCurrency = async (currency: string) => {
    setPreferences(prev => ({ ...prev, currency }));
    await updateSettingsMutation.mutateAsync({ currency });
  };

  const updateLanguage = async (language: string) => {
    setPreferences(prev => ({ ...prev, language }));
    await updateSettingsMutation.mutateAsync({ language });
  };

  const updateDateFormat = async (dateFormat: string) => {
    setPreferences(prev => ({ ...prev, dateFormat }));
    await updateSettingsMutation.mutateAsync({ dateFormat });
  };

  const formatCurrency = (value: number): string => {
    const currencyInfo = CURRENCY_SYMBOLS[preferences.currency] || CURRENCY_SYMBOLS["BRL"];
    
    // Formatar número com separadores apropriados
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));

    return `${currencyInfo.symbol} ${formattedValue}`;
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    switch (preferences.dateFormat) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`;
      case "YYYY/MM/DD":
        return `${year}/${month}/${day}`;
      case "DD.MM.YYYY":
        return `${day}.${month}.${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        updateCurrency,
        updateLanguage,
        updateDateFormat,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
