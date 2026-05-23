import { Clock, Plane, Briefcase } from "lucide-react";
import type { FlightOffer, FlightSegment } from "@/api-client";

interface FlightCardProps {
  offer: FlightOffer;
}

function formatTime(raw: string): string {
  if (!raw) return "";
  const dotMatch = raw.match(/\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2})/);
  if (dotMatch) return dotMatch[1];
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(raw));
  } catch {
    return raw;
  }
}

function formatDate(raw: string): string {
  if (!raw) return "";
  const dotMatch = raw.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (dotMatch) {
    const day = dotMatch[1];
    const month = dotMatch[2];
    return `${parseInt(month, 10)}月${parseInt(day, 10)}日`;
  }
  return raw;
}

export function FlightCard({ offer }: FlightCardProps) {
  const mainSegment = offer.segments[0];
  const lastSegment = offer.segments[offer.segments.length - 1];

  const departDateStr = mainSegment.departureTime.slice(0, 10);
  const arrivalDateStr = lastSegment.arrivalTime.slice(0, 10);
  const isOvernight = departDateStr !== arrivalDateStr;

  return (
    <div className="group bg-card border rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg select-none">
              {(offer.airline || mainSegment.airline).charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {offer.airline || mainSegment.airline}
              </p>
              <p className="text-xs text-muted-foreground">
                {offer.segments.length > 1
                  ? offer.segments.map((s: FlightSegment) => s.flightNumber).join(" / ")
                  : mainSegment.flightNumber}
              </p>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-4 justify-between sm:justify-center w-full">
            <div className="text-right flex-1">
              <p className="text-xl font-bold text-foreground leading-tight">
                {formatTime(mainSegment.departureTime)}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {mainSegment.departureAirport}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {formatDate(mainSegment.departureTime)}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center flex-[1.5] px-2">
              <p className="text-xs text-muted-foreground mb-1 font-medium">
                {offer.totalDuration}
              </p>
              <div className="w-full flex items-center gap-2">
                <div className="h-px bg-border flex-1 relative">
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/50 -left-0.5 -top-[2px]" />
                </div>
                <Plane className="w-4 h-4 text-primary shrink-0" />
                <div className="h-px bg-border flex-1 relative">
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/50 -right-0.5 -top-[2px]" />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                {offer.stops === 0 ? "直飞" : `${offer.stops} 经停`}
              </p>
            </div>

            <div className="text-left flex-1">
              <p className="text-xl font-bold text-foreground leading-tight">
                {formatTime(lastSegment.arrivalTime)}
                {isOvernight && (
                  <span className="text-xs font-normal text-orange-500 ml-1">+1</span>
                )}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {lastSegment.arrivalAirport}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {formatDate(lastSegment.arrivalTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-16 bg-border mx-2" />

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 lg:w-48 shrink-0">
          <div className="flex flex-col items-start lg:items-end">
            <p className="text-2xl font-bold text-foreground">
              ¥{offer.price.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">总价 · {offer.currency}</p>

            {offer.baggage && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{offer.baggage}</span>
              </div>
            )}
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]">
            选择
          </button>
        </div>
      </div>
    </div>
  );
}
