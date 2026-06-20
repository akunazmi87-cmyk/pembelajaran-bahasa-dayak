
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, MessageSquare, Trophy, Home, Languages, Gamepad2 } from "lucide-react";

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Penerjemah", href: "/translator", icon: Languages },
  { name: "Kosakata", href: "/vocabulary", icon: Book },
  { name: "Percakapan", href: "/conversation", icon: MessageSquare },
  { name: "Susun Kata", href: "/word-game", icon: Gamepad2 },
  { name: "Tantangan", href: "/challenge", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full glass-morphism border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold transition-transform group-hover:rotate-12">
            DN
          </div>
          <span className="font-headline font-bold text-xl">
            Pelestarian <span className="text-primary">Dayak Ngaju</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="md:hidden flex items-center gap-2 fixed bottom-0 left-0 right-0 bg-background border-t p-2 justify-around shadow-lg z-50 overflow-x-auto no-scrollbar">
           {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors min-w-[55px]",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
