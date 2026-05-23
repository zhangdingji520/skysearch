import { useState, useRef, useCallback, useEffect } from "react";
import { X, Search, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DOMESTIC_AIRPORTS, INTERNATIONAL_AIRPORTS,
  DOMESTIC_POPULAR, INTL_POPULAR, type AirportEntry,
} from "@/data/airports";

const ALPHABET = "ABCDEFGHJKLMNPQRSTWXYZ".split("");

function groupByInitial(airports: AirportEntry[]) {
  const map = new Map<string, AirportEntry[]>();
  for (const a of airports) {
    const key = a.initial.toUpperCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([letter, list]) => ({ letter, list }));
}

function searchAirports(airports: AirportEntry[], q: string): AirportEntry[] {
  const upper = q.toUpperCase(), lower = q.toLowerCase();
  return airports.filter(a =>
    a.iata.includes(upper) || a.city.includes(q) || a.city.toLowerCase().includes(lower) || a.name.includes(q)
  );
}

interface CitySelectSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (airport: AirportEntry) => void;
  selectedIata?: string;
}

export function CitySelectSheet({ open, onClose, onSelect, selectedIata }: CitySelectSheetProps) {
  const [tab, setTab] = useState<"domestic" | "intl">("domestic");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const airports = tab === "domestic" ? DOMESTIC_AIRPORTS : INTERNATIONAL_AIRPORTS;
  const popularIatas = tab === "domestic" ? DOMESTIC_POPULAR : INTL_POPULAR;
  const popularAirports = popularIatas.map(iata => airports.find(a => a.iata === iata)).filter(Boolean) as AirportEntry[];

  const isSearching = query.trim().length > 0;
  const searchResults = isSearching ? searchAirports(airports, query.trim()) : [];
  const grouped = groupByInitial(airports);
  const availableLetters = grouped.map(g => g.letter);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  const handleSelect = useCallback((airport: AirportEntry) => {
    onSelect(airport); onClose();
  }, [onSelect, onClose]);

  const scrollToLetter = (letter: string) => {
    const el = sectionRefs.current.get(letter);
    if (el && listRef.current) listRef.current.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#1ab0a6] px-3 pb-0 flex-shrink-0" style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
        <div className="flex items-center gap-2 py-2">
          <button onClick={onClose} className="text-white text-sm font-medium whitespace-nowrap px-1 py-1 active:opacity-70">取消</button>
          <div className="flex-1 flex items-center bg-white rounded-md overflow-hidden">
            <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
            <input
              ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="搜索城市、机场或IATA代码"
              className="flex-1 px-2 py-2 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery("")} className="px-2 py-1">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex mt-1">
          <button onClick={() => { setTab("domestic"); setQuery(""); }}
            className={cn("flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors",
              tab === "domestic" ? "text-white border-white" : "text-white/60 border-transparent")}>
            国内
          </button>
          <button onClick={() => { setTab("intl"); setQuery(""); }}
            className={cn("flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors",
              tab === "intl" ? "text-white border-white" : "text-white/60 border-transparent")}>
            国际/中国港澳台
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 relative">
        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
          {isSearching ? (
            <div>
              {searchResults.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">未找到匹配的城市或机场</div>
              ) : searchResults.map(airport => (
                <AirportRow key={airport.iata} airport={airport} selected={airport.iata === selectedIata} onSelect={handleSelect} />
              ))}
            </div>
          ) : (
            <>
              {/* 定位 */}
              <div className="bg-white mb-2">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium bg-gray-50 border-b border-gray-100">定位</div>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-[#1ab0a6] text-sm font-medium active:bg-gray-50">
                  <MapPin className="w-4 h-4" />点击获取位置
                </button>
              </div>

              {/* 热门城市 */}
              <div className="bg-white mb-2">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium bg-gray-50 border-b border-gray-100">热门城市</div>
                <div className="p-3 grid grid-cols-4 gap-2">
                  {popularAirports.map(airport => (
                    <button key={airport.iata} onClick={() => handleSelect(airport)}
                      className={cn("py-2 px-1 text-sm rounded border text-center transition-all active:scale-95",
                        selectedIata === airport.iata
                          ? "bg-[#1ab0a6] text-white border-[#1ab0a6] font-medium"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#1ab0a6] hover:text-[#1ab0a6]")}>
                      {airport.city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alphabetical */}
              <div className="bg-white mb-2">
                {grouped.map(({ letter, list }) => (
                  <div key={letter} ref={el => { if (el) sectionRefs.current.set(letter, el); }}>
                    <div className="px-4 py-1.5 text-xs text-gray-400 font-bold bg-gray-50 border-y border-gray-100">{letter}</div>
                    {list.map(airport => (
                      <AirportRow key={airport.iata} airport={airport} selected={airport.iata === selectedIata} onSelect={handleSelect} />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* A-Z index */}
        {!isSearching && (
          <div className="absolute right-0 top-0 bottom-0 w-7 flex flex-col items-center justify-center gap-0 py-2 z-10">
            {ALPHABET.map(letter => {
              const avail = availableLetters.includes(letter);
              return (
                <button key={letter} onClick={() => avail && scrollToLetter(letter)}
                  className={cn("w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full transition-colors",
                    avail ? "text-[#1ab0a6] active:bg-[#1ab0a6] active:text-white" : "text-gray-300 cursor-default")}>
                  {letter}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AirportRow({ airport, selected, onSelect }: { airport: AirportEntry; selected: boolean; onSelect: (a: AirportEntry) => void }) {
  return (
    <button onClick={() => onSelect(airport)}
      className={cn("flex items-center justify-between w-full px-4 py-3 border-b border-gray-100 text-left active:bg-gray-50 transition-colors", selected && "bg-teal-50")}>
      <div className="flex flex-col">
        <span className={cn("text-sm font-medium", selected ? "text-[#1ab0a6]" : "text-gray-800")}>
          {airport.city}
          <span className="ml-2 text-xs font-mono text-gray-400">{airport.iata}</span>
        </span>
        <span className="text-xs text-gray-400 mt-0.5">
          {airport.name}
          {airport.country !== "中国" && <span className="ml-1 text-gray-300">· {airport.country}</span>}
        </span>
      </div>
      {selected && <ChevronRight className="w-4 h-4 text-[#1ab0a6] shrink-0" />}
    </button>
  );
}
