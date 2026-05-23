import { Plane } from "lucide-react";
export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 flex items-center gap-2">
      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
        <Plane className="h-6 w-6 text-white rotate-45"/>
      </div>
      <div>
        <h1 className="text-white font-bold text-xl tracking-tight leading-none">SkySearch</h1>
        <p className="text-white/70 text-xs leading-none mt-0.5">全球机票一搜即达</p>
      </div>
    </header>
  );
}
