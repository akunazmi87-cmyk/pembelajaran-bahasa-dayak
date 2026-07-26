
'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Book, MessageSquare, Languages, Sparkles, Gamepad2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useDoc } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';

export default function Home() {
  const db = useFirestore();
  const statsRef = useMemo(() => doc(db, 'stats', 'website'), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  useEffect(() => {
    const trackVisit = async () => {
      // Pastikan kode hanya berjalan di browser
      if (typeof window === 'undefined') return;

      // Gunakan sessionStorage agar setiap sesi baru (orang masuk baru) dihitung
      const sessionKey = 'site_visited_session';
      const hasVisitedInSession = sessionStorage.getItem(sessionKey);

      if (!hasVisitedInSession) {
        try {
          await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsRef);
            if (!statsDoc.exists()) {
              transaction.set(statsRef, { totalVisitors: 1 });
            } else {
              const currentCount = statsDoc.data().totalVisitors || 0;
              transaction.update(statsRef, {
                totalVisitors: currentCount + 1
              });
            }
          });
          // Tandai bahwa sesi ini sudah dihitung
          sessionStorage.setItem(sessionKey, 'true');
        } catch (error) {
          console.warn("Visitor counter error:", error);
        }
      }
    };

    trackVisit();
  }, [db, statsRef]);

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

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col gap-16">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full text-primary font-bold text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          Media Belajar Interaktif
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-bold text-foreground leading-tight">
          Lestarikan Bahasa<br />
          <span className="text-primary italic">Dayak Ngaju</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Habaring Hurung - Bergotong Royong Melestarikan Budaya.
          Platform pembelajaran digital untuk generasi muda Kalimantan Tengah.
        </p>
        
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            asChild
            variant="default" 
            size="lg" 
            className="rounded-full h-14 px-8 gap-3 shadow-xl font-bold"
          >
            <Link href="/vocabulary">Mulai Belajar Sekarang</Link>
          </Button>
          <Button 
            asChild
            variant="outline" 
            size="lg" 
            className="rounded-full h-14 px-8 gap-3 font-bold border-primary text-primary hover:bg-primary/5"
          >
            <Link href="/challenge">Uji Kemampuan</Link>
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

      {/* Visitor Counter Card */}
      <div className="max-w-sm mx-auto w-full">
        <Card className="bg-card border-2 border-primary/10 shadow-xl text-center overflow-hidden">
          <div className="h-1.5 bg-primary/20 w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Total Pengunjung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="text-4xl font-headline font-bold text-primary">
              {stats?.totalVisitors?.toLocaleString('id-ID') || '0'}
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed px-4">
              Terima kasih telah mengunjungi media pembelajaran Bahasa Dayak Ngaju.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
