import { AlertCircle, ArrowUpDown, Plane } from "lucide-react";
import { FlightCard } from "./flight-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { FlightSearchResult, FlightOffer } from "@/api-client";

interface ResultsListProps {
  isLoading: boolean;
  error?: string | null;
  outboundResult?: FlightSearchResult;
  returnResult?: FlightSearchResult;
  isRoundTrip: boolean;
  hasSearched: boolean;
}

function SkeletonSection() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}

function FlightSection({
  label,
  result,
}: {
  label: string;
  result: FlightSearchResult;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {label} — {result.totalCount ?? result.offers.length} 个航班
          </h2>
          <p className="text-sm text-muted-foreground">按价格从低到高排列</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-background border rounded-lg hover:bg-muted transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            价格排序
          </button>
        </div>
      </div>

      {result.offers.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">未找到航班</p>
          <p className="text-sm text-muted-foreground mt-1">请尝试调整日期或机场</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {result.offers.map((offer: FlightOffer) => (
            <FlightCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ResultsList({
  isLoading,
  error,
  outboundResult,
  returnResult,
  isRoundTrip,
  hasSearched,
}: ResultsListProps) {
  if (!hasSearched && !isLoading && !error && !outboundResult) {
    return (
      <div className="py-24 text-center">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Plane className="w-8 h-8 text-primary opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">去哪里？</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          输入出行信息，为您搜索最优惠的航班。
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">
        <SkeletonSection />
        {isRoundTrip && <SkeletonSection />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg">搜索失败</AlertTitle>
          <AlertDescription className="text-sm mt-1">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!outboundResult) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-12">
      <FlightSection
        label={isRoundTrip ? "去程" : "可选航班"}
        result={outboundResult}
      />

      {isRoundTrip && returnResult && (
        <>
          <div className="h-px bg-border" />
          <FlightSection label="返程" result={returnResult} />
        </>
      )}
    </div>
  );
}
