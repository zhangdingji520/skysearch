import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SearchForm, type SearchFormData } from "@/components/search/search-form";
import { FlightResults } from "@/components/results/flight-results";
import { Header } from "@/components/layout/header";
import { searchFlights } from "@/api-client";
import type { FlightOffer } from "@/api-client";

export function HomePage() {
  const [results, setResults] = useState<FlightOffer[]>([]);
  const [searchError, setSearchError] = useState<string|undefined>();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SearchFormData) => searchFlights(data.outbound),
    onSuccess: (data) => { setResults(data.offers); setSearchError(undefined); },
    onError: (err: Error) => { setSearchError(err.message||"查询失败，请重试"); setResults([]); },
  });

  const handleSearch = (data: SearchFormData) => {
    setResults([]); setSearchError(undefined);
    mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary via-orange-500 to-amber-500 pt-20 pb-32 sm:pb-40 overflow-hidden">
        <Header/>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]"/>
        <div className="text-center px-4 pt-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">搜索全球航班</h2>
          <p className="text-white/80 mt-2 text-base sm:text-lg">实时票价，透明比价，轻松出行</p>
        </div>
      </div>

      {/* Search form card overlaps hero */}
      <SearchForm onSearch={handleSearch} isLoading={isPending}/>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 pb-16">
        <FlightResults offers={results} isLoading={isPending} error={searchError}/>
      </div>
    </div>
  );
}
