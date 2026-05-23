import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitySelectSheet } from "./city-select-sheet";
import type { AirportEntry } from "@/data/airports";

interface LocationInputProps {
  value: string;
  onChange: (iata: string, airport: AirportEntry) => void;
  airport?: AirportEntry | null;
  placeholder?: string;
  label?: string;
}

export function LocationInput({ value, onChange, airport: airportProp, placeholder = "选择城市或机场", label }: LocationInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {label && <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>}
        <button type="button" onClick={() => setOpen(true)}
          className={cn("w-full flex items-center justify-between h-14 px-4 rounded-md border border-input bg-background/50 hover:bg-background text-left transition-colors", !value && "text-muted-foreground")}>
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            {airportProp ? (
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-foreground text-base truncate">{airportProp.city}</span>
                <span className="text-muted-foreground text-sm font-mono shrink-0">{airportProp.iata}</span>
              </span>
            ) : (
              <span className="text-base truncate">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        </button>
      </div>
      <CitySelectSheet open={open} onClose={() => setOpen(false)} onSelect={a => onChange(a.iata, a)} selectedIata={value || undefined} />
    </>
  );
}
