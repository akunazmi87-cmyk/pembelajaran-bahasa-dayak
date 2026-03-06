
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, MessageSquare, Trophy, Home } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Kosakata", href: "/vocabulary", icon: Book },
  { name: "Percakapan", href: "/conversation", icon: MessageSquare },
  { name: "Tantangan", href: "/challenge", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const logo = PlaceHolderImages.find(img => img.id === "logo-habaring-hurung");

  return (
    <nav className="sticky top-0 z-50 w-full glass-morphism border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt={logo.description} 
                width={40} 
                height={40} 
                className="object-contain"
                data-ai-hint={logo.imageHint}
              />
            )}
          </div>
          <span className="font-headline font-bold text-xl hidden sm:inline-block">
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

        <div className="md:hidden flex items-center gap-4 fixed bottom-0 left-0 right-0 bg-background border-t p-2 justify-around shadow-lg">
           {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors",
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
