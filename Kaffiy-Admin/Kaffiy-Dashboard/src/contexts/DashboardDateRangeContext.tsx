import { createContext, useContext, useMemo, useState } from "react";
import { differenceInCalendarDays, endOfDay, startOfDay, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

export type DashboardDatePreset = "daily" | "weekly" | "monthly" | "custom";

interface DashboardDateRangeContextValue {
  preset: DashboardDatePreset;
  setPreset: (preset: DashboardDatePreset) => void;
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  rangeDays: number;
  isCustomRange: boolean;
}

const DashboardDateRangeContext = createContext<DashboardDateRangeContextValue | undefined>(
  undefined,
);

const getPresetRangeDays = (preset: DashboardDatePreset) => {
  switch (preset) {
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "daily":
    default:
      return 1;
  }
};

const getCustomRangeDays = (range: DateRange | undefined) => {
  if (!range?.from || !range?.to) return 1;
  const from = startOfDay(range.from);
  const to = endOfDay(range.to);
  return Math.max(1, differenceInCalendarDays(to, from) + 1);
};

export const DashboardDateRangeProvider = ({ children }: { children: React.ReactNode }) => {
  const [preset, setPreset] = useState<DashboardDatePreset>("daily");
  const [range, setRange] = useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 0)),
    to: endOfDay(new Date()),
  });

  const isCustomRange = preset === "custom";
  const rangeDays = useMemo(() => {
    return isCustomRange ? getCustomRangeDays(range) : getPresetRangeDays(preset);
  }, [preset, range, isCustomRange]);

  return (
    <DashboardDateRangeContext.Provider
      value={{
        preset,
        setPreset,
        range,
        setRange,
        rangeDays,
        isCustomRange,
      }}
    >
      {children}
    </DashboardDateRangeContext.Provider>
  );
};

export const useDashboardDateRange = () => {
  const context = useContext(DashboardDateRangeContext);
  if (!context) {
    throw new Error("useDashboardDateRange must be used within DashboardDateRangeProvider");
  }
  return context;
};
