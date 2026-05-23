import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationInput } from "./location-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FlightSearchInput,
  FlightSearchInputFlightClass,
} from "@/api-client";
import type { Airport } from "@/api-client";

export type TripType = "oneway" | "roundtrip";

export interface SearchFormData {
  tripType: TripType;
  outbound: FlightSearchInput;
  returnFlight?: FlightSearchInput;
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

const CN_WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [adults, setAdults] = useState("1");
  const [flightClass, setFlightClass] =
    useState<FlightSearchInputFlightClass>("Econom");

  const handleSwap = () => {
    setOriginAirport(destinationAirport);
    setDestinationAirport(originAirport);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originAirport || !destinationAirport || !departDate) return;
    if (tripType === "roundtrip" && !returnDate) return;

    const base = {
      origin: originAirport.iata,
      destination: destinationAirport.iata,
      adults: parseInt(adults, 10),
      flightClass,
    };

    onSearch({
      tripType,
      outbound: { ...base, date: format(departDate, "dd.MM.yyyy") },
      returnFlight:
        tripType === "roundtrip" && returnDate
          ? {
              ...base,
              origin: destinationAirport.iata,
              destination: originAirport.iata,
              date: format(returnDate, "dd.MM.yyyy"),
            }
          : undefined,
    });
  };

  const isComplete =
    originAirport &&
    destinationAirport &&
    departDate &&
    (tripType === "oneway" || returnDate);

  const classLabel =
    flightClass === "Econom"
      ? "经济舱"
      : flightClass === "Business"
        ? "商务舱"
        : "头等舱";

  const calendarFormatters = {
    formatWeekdayName: (date: Date) => CN_WEEKDAYS[date.getDay()],
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-16 sm:-mt-24 relative z-10 px-4 sm:px-6">
      <div className="bg-card rounded-2xl shadow-xl border overflow-hidden">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setTripType("oneway")}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              tripType === "oneway"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            单程
          </button>
          <button
            type="button"
            onClick={() => setTripType("roundtrip")}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              tripType === "roundtrip"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            往返
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <LocationInput
              label="出发地"
              placeholder="出发城市或机场"
              value={originAirport?.iata ?? ""}
              airport={originAirport}
              onChange={(_iata, airport) => setOriginAirport(airport)}
            />
            <div className="flex flex-col pb-px">
              <div className="h-5" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full shrink-0 w-10 h-14 shadow-sm hover:bg-muted"
                onClick={handleSwap}
              >
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <LocationInput
              label="目的地"
              placeholder="到达城市或机场"
              value={destinationAirport?.iata ?? ""}
              airport={destinationAirport}
              onChange={(_iata, airport) => setDestinationAirport(airport)}
            />
          </div>

          <div
            className={cn(
              "grid gap-4",
              tripType === "roundtrip"
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
            )}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                出发日期
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base",
                      !departDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {departDate
                        ? format(departDate, "yyyy年M月d日")
                        : "选择日期"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departDate}
                    onSelect={(d) => {
                      setDepartDate(d);
                      if (returnDate && d && d >= returnDate)
                        setReturnDate(undefined);
                    }}
                    initialFocus
                    disabled={(d) =>
                      d < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    formatters={calendarFormatters}
                    className="[--cell-size:2.75rem] text-base"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {tripType === "roundtrip" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  返回日期
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base",
                        !returnDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {returnDate
                          ? format(returnDate, "yyyy年M月d日")
                          : "选择日期"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      initialFocus
                      disabled={(d) =>
                        d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        (!!departDate && d <= departDate)
                      }
                      formatters={calendarFormatters}
                      className="[--cell-size:2.75rem] text-base"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                乘客 &amp; 舱位
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base"
                  >
                    <Users className="mr-3 h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {adults} 位乘客 · {classLabel}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4" align="end">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">成人</p>
                        <p className="text-xs text-muted-foreground">12岁以上</p>
                      </div>
                      <Select value={adults} onValueChange={setAdults}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} 位
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">舱位</p>
                      <Select
                        value={flightClass}
                        onValueChange={(val: FlightSearchInputFlightClass) =>
                          setFlightClass(val)
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Econom">经济舱</SelectItem>
                          <SelectItem value="Business">商务舱</SelectItem>
                          <SelectItem value="First">头等舱</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto px-10 h-14 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
              disabled={!isComplete || isLoading}
            >
              {isLoading ? "正在搜索..." : "搜索航班"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
