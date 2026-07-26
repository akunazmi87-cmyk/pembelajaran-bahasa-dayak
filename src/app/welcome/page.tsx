
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, UserCircle, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/firebase";
import Link from "next/link";

export default function WelcomePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const guestName = sessionStorage.getItem("guest_name");
    if (!loading && (user || guestName)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (!mounted || loading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center shadow-xl border border-primary/20 rotate-3 transition-transform hover:rotate-0 duration-300">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-foreground">
              Belajar Bahasa <span className="text-primary italic">Dayak Ngaju</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Lestarikan budaya Kalimantan Tengah lewat genggaman Anda.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8 space-y-4">
            <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg" size="lg">
              <Link href="/login">
                <LogIn className="mr-2 w-5 h-5" /> Masuk ke Akun
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold border-2 hover:bg-primary/5" size="lg">
              <Link href="/register">
                <UserPlus className="mr-2 w-5 h-5" /> Daftar Akun Baru
              </Link>
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-muted-foreground">
                <span className="bg-background px-2">Atau</span>
              </div>
            </div>

            <Button asChild variant="ghost" className="w-full h-14 rounded-2xl text-lg font-bold text-primary hover:bg-primary/10" size="lg">
              <Link href="/auth/guest">
                <UserCircle className="mr-2 w-5 h-5" /> Masuk sebagai Tamu
              </Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground font-medium">
          Habaring Hurung - Bergotong Royong Melestarikan Budaya.
        </p>
      </div>
    </div>
  );
}
