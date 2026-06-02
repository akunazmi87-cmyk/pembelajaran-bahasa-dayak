
"use client";

import Link from "next/link";
import Image from "next/image";
import { Book, MessageSquare, Trophy, Play, Music, Languages, Sparkles, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const heroImage = PlaceHolderImages.find(img => img.id === "budaya-dayak");

  const toggleWelcomeAudio = () => {
    setIsPlaying(!isPlaying);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const modules = [
    {
      title: "Penerjemah Pintar",
      description: "Terjemahkan kalimat dengan bantuan AI dan database sekolah secara akurat.",
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
      description: "Latih kemampuan bicara dengan simulasi dialog sehari-hari di sekolah.",
      icon: MessageSquare,
      href: "/conversation",
      color: "bg-primary/10 text-primary",
      buttonText: "Mulai Dialog"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full text-primary font-bold text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          Aplikasi Pemandu Lobby Sekolah
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-bold text-foreground leading-tight">
          Lestarikan Bahasa<br />
          <span className="text-primary italic">Dayak Ngaju</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Habaring Hurung - Bergotong Royong Melestarikan Budaya.
          Media belajar interaktif untuk siswa dan pemandu sekolah masa depan.
        </p>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={toggleWelcomeAudio}
            variant="outline" 
            size="lg" 
            className="rounded-full h-14 px-8 gap-3 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-xl font-bold"
          >
            {isPlaying ? <Music className="animate-bounce" /> : <Play />}
            Dengarkan Sapaan Dayak Ngaju
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

      <section className="mt-24 glass-morphism p-12 rounded-[2.5rem] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
        <div className="space-y-8 relative z-10">
          <h2 className="text-4xl font-headline font-bold">
            Fitur Pemandu Lobby Pintar
          </h2>
          <ul className="space-y-4">
            {[
              "Database terjemahan sapaan tamu sekolah yang akurat.",
              "Dukungan AI untuk menerjemahkan kalimat kompleks.",
              "Mini game edukasi untuk menghafal kosakata.",
              "Audio pelafalan asli (TTS) untuk belajar intonasi.",
              "Pencatatan riwayat belajar siswa secara otomatis di Firestore."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4 text-muted-foreground font-medium text-lg">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                {text}
              </li>
            ))}
          </ul>
          <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold shadow-lg" asChild>
            <Link href="/translator">Mulai Belajar Sekarang</Link>
          </Button>
        </div>
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
          {heroImage && (
            <Image 
              src={heroImage.imageUrl} 
              alt={heroImage.description} 
              fill
              className="object-cover transition-transform hover:scale-105 duration-700"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
            <p className="text-white font-bold text-xl leading-relaxed italic">
              "Melestarikan bahasa daerah, menjaga identitas bangsa di era digital."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
