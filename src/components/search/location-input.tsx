import { useState, useEffect } from "react";
import { Check, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useGetPopularAirports,
  useSearchAirports,
  getSearchAirportsQueryKey,
} from "@/api-client";
import type { Airport } from "@/api-client";

interface LocationInputProps {
  value: string;
  onChange: (iata: string, airport: Airport) => void;
  airport?: Airport | null;
  placeholder?: string;
  label?: string;
}

export function LocationInput({
  value,
  onChange,
  airport: airportProp,
  placeholder = "选择城市或机场",
  label,
}: LocationInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: popularAirports = [] } = useGetPopularAirports();
  const { data: searchResults = [], isLoading: isLoadingSearch } =
    useSearchAirports(
      { q: debouncedQuery },
      {
        query: {
          enabled: debouncedQuery.length > 1,
          queryKey: getSearchAirportsQueryKey({ q: debouncedQuery }),
        },
      }
    );

  const displayAirports = debouncedQuery.length > 1 ? searchResults : popularAirports;

  const handleSelect = (airport: Airport) => {
    onChange(airport.iata, airport);
    setOpen(false);
    setSearchQuery("");
  };

  const displayAirport =
    airportProp ??
    [...popularAirports, ...searchResults].find((a) => a.iata === value) ??
    null;

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setSearchQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-start h-14 text-base border-input bg-background/50 hover:bg-background shadow-none truncate",
              !value && "text-muted-foreground"
            )}
          >
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mr-3" />
            <span className="truncate">
              {displayAirport ? (
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {displayAirport.city}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ({displayAirport.iata})
                  </span>
                </span>
              ) : (
                placeholder
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="搜索机场或城市..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <CommandList>
              <CommandEmpty>
                {isLoadingSearch ? "搜索中..." : "未找到机场"}
              </CommandEmpty>
              <CommandGroup
                heading={debouncedQuery.length > 1 ? "搜索结果" : "热门目的地"}
              >
                {displayAirports.map((airport: Airport) => (
                  <CommandItem
                    key={airport.iata}
                    value={airport.iata}
                    onSelect={() => handleSelect(airport)}
                    className="flex items-center justify-between gap-2 p-3 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {airport.city} ({airport.iata})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {airport.name}, {airport.country}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary shrink-0",
                        value === airport.iata ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
