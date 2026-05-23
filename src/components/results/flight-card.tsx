import { cn } from "@/lib/utils";
import { Plane, ChevronDown, ChevronUp, Briefcase, BaggageClaim } from "lucide-react";
import { useState } from "react";
import type { FlightOffer } from "@/api-client";

interface FlightCardProps { offer: FlightOffer; }

const AIRLINE_LOGOS: Record<string,string> = {
  CA:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Air_China_logo.svg/120px-Air_China_logo.svg.png",
  MU:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/China_Eastern_Airlines_logo.svg/120px-China_Eastern_Airlines_logo.svg.png",
  CZ:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/China_Southern_Airlines_logo_%282019%29.svg/120px-China_Southern_Airlines_logo_%282019%29.svg.png",
};
function getLogoUrl(airline: string) { const code=airline.slice(0,2).toUpperCase(); return AIRLINE_LOGOS[code]||null; }

function fmt(dt: string) {
  if (!dt) return "—";
  const m = dt.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2})/);
  if (m) return m[4];
  const m2 = dt.match(/\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/);
  return m2 ? m2[1] : dt.slice(-5);
}
function fmtDate(dt: string) {
  const m = dt.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return dt.slice(0,10);
}

export function FlightCard({ offer }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length-1];
  const logoUrl = getLogoUrl(offer.airline||first?.airline||"");

  return (
    <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {logoUrl ? (
              <img src={logoUrl} alt={offer.airline} className="h-7 w-auto object-contain shrink-0" onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Plane className="h-3.5 w-3.5 text-primary"/>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{offer.airline||first?.airline} · {first?.flightNumber}</p>
              {offer.baggage && <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5"><BaggageClaim className="h-3 w-3"/>{offer.baggage}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-8 shrink-0">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold tabular-nums">{fmt(first?.departureTime)}</p>
              <p className="text-xs text-muted-foreground font-mono">{first?.departureAirport}</p>
            </div>
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <p className="text-xs whitespace-nowrap">{offer.totalDuration}</p>
              <div className="flex items-center gap-1">
                <div className="h-px w-8 sm:w-16 bg-border"/>
                <Plane className="h-3 w-3 rotate-90"/>
                <div className="h-px w-8 sm:w-16 bg-border"/>
              </div>
              <p className="text-xs">{offer.stops===0?"直飞":`经停 ${offer.stops} 次`}</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold tabular-nums">{fmt(last?.arrivalTime)}</p>
              <p className="text-xs text-muted-foreground font-mono">{last?.arrivalAirport}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">¥{offer.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">每人</p>
            </div>
            <button onClick={()=>setExpanded(!expanded)} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
              {expanded?<><ChevronUp className="h-3 w-3"/>收起</>:<><ChevronDown className="h-3 w-3"/>详情</>}
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t bg-muted/30 p-4 space-y-3">
          {offer.segments.map((seg,i)=>(
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="h-2 w-2 rounded-full bg-primary"/>
                {i<offer.segments.length-1 && <div className="h-10 w-px bg-border mt-1"/>}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{fmt(seg.departureTime)} <span className="font-mono text-muted-foreground">{seg.departureAirport}</span></p>
                  <p className="text-xs text-muted-foreground">{seg.airline} {seg.flightNumber}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">飞行时间 {seg.duration}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-semibold text-sm">{fmt(seg.arrivalTime)} <span className="font-mono text-muted-foreground">{seg.arrivalAirport}</span></p>
                  <p className="text-xs text-muted-foreground">{fmtDate(seg.departureTime)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
