import { AlertCircle, Frown, Loader2, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { FlightCard } from "./flight-card";
import type { FlightOffer } from "@/api-client";
import { cn } from "@/lib/utils";

interface FlightResultsProps { offers: FlightOffer[]; isLoading: boolean; error?: string; }
type SortKey = "price" | "duration" | "departure";

export function FlightResults({ offers, isLoading, error }: FlightResultsProps) {
  const [sort, setSort] = useState<SortKey>("price");

  const sorted = useMemo(() => {
    const copy = [...offers];
    if (sort==="price") copy.sort((a,b)=>a.price-b.price);
    else if (sort==="duration") copy.sort((a,b)=>a.totalDuration.localeCompare(b.totalDuration));
    else copy.sort((a,b)=>a.segments[0]?.departureTime.localeCompare(b.segments[0]?.departureTime||"")||0);
    return copy;
  }, [offers, sort]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
      <Loader2 className="h-10 w-10 animate-spin text-primary"/>
      <p className="text-base font-medium">正在搜索航班，请稍候...</p>
      <p className="text-sm">连接 city.travel 查询实时票价</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <AlertCircle className="h-10 w-10 text-destructive"/>
      <p className="text-base font-medium text-foreground">查询失败</p>
      <p className="text-sm text-center max-w-sm">{error}</p>
    </div>
  );

  if (!offers.length) return null;

  const sortOptions: {key:SortKey;label:string}[] = [
    {key:"price",label:"价格最低"},
    {key:"departure",label:"最早出发"},
    {key:"duration",label:"飞行最短"},
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">找到 <span className="font-semibold text-foreground">{offers.length}</span> 个航班</p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground"/>
          <div className="flex rounded-lg border overflow-hidden">
            {sortOptions.map(o=>(
              <button key={o.key} onClick={()=>setSort(o.key)}
                className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  sort===o.key?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground hover:bg-muted")}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {sorted.map(offer=><FlightCard key={offer.id} offer={offer}/>)}
    </div>
  );
}
