'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { Book, MessageSquare, Trophy, Languages, Sparkles, Gamepad2, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const modules = [
    {
      title: "Penerjemah Pintar",
      description: "Terjemahkan kalimat dengan bantuan AI dan database lokal secara akurat.",
      icon: Languages,
      href: "/translator",
      color: "bg-primary/10 text-primary",
      buttonText: "Buka Penerjemah"
    },
    {
      title: "Susun Kata",
      description: "Game edukasi menyusun huruf menjadi kosakata Dayak Ngaju yang benar.",
      icon: Gamepad2,
      href: "/word-game",
      color: "bg-primary/10 text-primary",
      buttonText: "Main Sekarang"
    },
    {
      title: "Ruang Kosakata",
      description: "Pelajari kata-kata dasar dan cari terjemahan dengan kamus interaktif kami.",
      icon: Book,
      href: "/vocabulary",
      color: "bg-primary/10 text-primary",
      buttonText: "Buka Kamus"
    },
    {
      title: "Ruang Percakapan",
      description: "Latih kemampuan bicara dengan simulasi dialog sehari-hari.",
      icon: MessageSquare,
      href: "/conversation",
      color: "bg-primary/10 text-primary",
      buttonText: "Mulai Dialog"
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Memverifikasi sesi...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full text-primary font-bold text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          Selamat Datang, {user.displayName || 'Murid'}!
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-bold text-foreground leading-tight">
          Lestarikan Bahasa<br />
          <span className="text-primary italic">Dayak Ngaju</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Habaring Hurung - Bergotong Royong Melestarikan Budaya.
          Media belajar interaktif untuk masa depan.
        </p>
        
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            asChild
            variant="default" 
            size="lg" 
            className="rounded-full h-14 px-8 gap-3 shadow-xl font-bold"
          >
            <Link href="/vocabulary">Mulai Belajar</Link>
          </Button>
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            size="lg" 
            className="rounded-full h-14 px-8 gap-3 text-destructive hover:bg-destructive/10 font-bold"
          >
            <LogOut className="w-5 h-5" /> Keluar
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <Link key={index} href={module.href}>
            <Card className="h-full hover-lift border-none shadow-lg overflow-hidden flex flex-col group">
              <div className={`p-8 flex items-center justify-center transition-colors ${module.color} group-hover:bg-primary group-hover:text-white`}>
                <module.icon className="w-16 h-16 transition-transform group-hover:scale-110" />
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="font-headline text-2xl">{module.title}</CardTitle>
                <CardDescription className="text-base pt-2 font-medium">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <Button className="w-full font-bold h-12 rounded-xl" variant="secondary">
                  {module.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
