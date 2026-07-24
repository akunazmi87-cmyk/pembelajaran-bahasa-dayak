
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, MessageSquare, Trophy, Home, Languages, Gamepad2, GraduationCap, ShieldCheck } from "lucide-react";

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

        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.name}
            </Link>
          ))}
          <div className="flex gap-2 ml-4">
            <Link 
              href="/guru/login" 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                pathname.startsWith("/guru") 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              title="Akses Guru"
            >
              <GraduationCap className="w-3 h-3" />
              Guru
            </Link>
            <Link 
              href="/admin/login" 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                pathname.startsWith("/admin") 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-accent/10 text-accent hover:bg-accent/20"
              )}
              title="Akses Admin"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin
            </Link>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-1 fixed bottom-0 left-0 right-0 bg-background border-t p-2 justify-around shadow-lg z-50 overflow-x-auto no-scrollbar">
           {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[9px] font-medium transition-colors min-w-[45px]",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
          <Link
            href="/guru/login"
            className={cn(
              "flex flex-col items-center gap-1 text-[9px] font-medium transition-colors min-w-[45px]",
              pathname.startsWith("/guru") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <GraduationCap className="w-4 h-4" />
            Guru
          </Link>
          <Link
            href="/admin/login"
            className={cn(
              "flex flex-col items-center gap-1 text-[9px] font-medium transition-colors min-w-[45px]",
              pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
