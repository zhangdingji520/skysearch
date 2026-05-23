import { Link } from "wouter";
import { Plane } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <Plane className="h-6 w-6" strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight">SkySearch</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">搜索航班</Link>
          <button className="hover:text-foreground transition-colors cursor-not-allowed opacity-50">我的行程</button>
          <button className="hover:text-foreground transition-colors cursor-not-allowed opacity-50">在线值机</button>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium hover:text-primary transition-colors cursor-not-allowed opacity-50">登录</button>
        </div>
      </div>
    </header>
  );
}
