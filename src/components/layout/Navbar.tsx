
'use client';

import NextLink from "next/link";
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
    <nav className="sticky top-0 z-50 w-full glass-morphism border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <NextLink href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold transition-transform group-hover:rotate-12 shadow-lg">
            DN
          </div>
          <span className="font-headline font-bold text-xl hidden sm:inline-block">
            Pelestarian <span className="text-primary italic">Dayak Ngaju</span>
          </span>
        </NextLink>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:bg-primary/10",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NextLink>
          ))}
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 fixed bottom-0 left-0 right-0 bg-background border-t p-2 justify-around shadow-lg z-50 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[9px] font-bold transition-colors min-w-[50px] py-1",
                pathname === item.href ? "text-primary scale-110" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NextLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
