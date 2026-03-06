"use client";

import Link from "next/link";
import { Book, MessageSquare, Trophy, Play, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleWelcomeAudio = () => {
    // In a real app, this would play an actual audio file from Firebase Storage
    console.log("Playing welcome audio...");
    setIsPlaying(!isPlaying);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const modules = [
    {
      title: "Ruang Kosakata",
      description: "Pelajari kata-kata dasar dan cari terjemahan dengan kamus interaktif kami.",
      icon: Book,
      href: "/vocabulary",
      color: "bg-emerald-100 text-emerald-600",
      buttonText: "Buka Kamus"
    },
    {
      title: "Ruang Percakapan",
      description: "Latih kemampuan bicara dengan simulasi dialog sehari-hari di sekolah.",
      icon: MessageSquare,
      href: "/conversation",
      color: "bg-lime-100 text-lime-600",
      buttonText: "Mulai Dialog"
    },
    {
      title: "Tantangan Akhir",
      description: "Uji kemampuanmu dengan latihan soal interaktif dan dapatkan skor terbaik.",
      icon: Trophy,
      href: "/challenge",
      color: "bg-amber-100 text-amber-600",
      buttonText: "Ikuti Kuis"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 space-y-6">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground leading-tight">
          Aplikasi Pembelajaran<br />
          <span className="text-primary">Bahasa Dayak Ngaju</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Belajar bahasa daerah jadi lebih seru dan mudah dengan DayakLingua. 
          Dirancang khusus untuk membantu siswa menguasai Bahasa Dayak Ngaju secara interaktif.
        </p>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={toggleWelcomeAudio}
            variant="outline" 
            size="lg" 
            className="rounded-full gap-3 border-primary text-primary hover:bg-primary hover:text-white transition-all"
          >
            {isPlaying ? <Music className="animate-bounce" /> : <Play />}
            Dengarkan Sapaan Dayak Ngaju
          </Button>
        </div>
      </section>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {modules.map((module, index) => (
          <Link key={index} href={module.href}>
            <Card className="h-full hover-lift border-none shadow-md overflow-hidden flex flex-col">
              <div className={`p-6 flex items-center justify-center ${module.color}`}>
                <module.icon className="w-12 h-12" />
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="font-headline text-2xl">{module.title}</CardTitle>
                <CardDescription className="text-base pt-2">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Button className="w-full font-medium" variant="secondary">
                  {module.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <section className="mt-24 glass-morphism p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-headline font-bold">Mengapa Belajar di DayakLingua?</h2>
          <ul className="space-y-3">
            {[
              "Materi yang disesuaikan dengan kurikulum sekolah.",
              "Dilengkapi audio pelafalan asli dari penutur daerah.",
              "Latihan interaktif untuk mengasah kemampuan.",
              "Dapat diakses kapan saja dan di mana saja secara mandiri."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src="https://picsum.photos/seed/dayak/800/600" 
            alt="Budaya Dayak" 
            className="object-cover w-full h-full"
            data-ai-hint="Dayak culture"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <p className="text-white font-medium">Melestarikan bahasa daerah, menjaga identitas bangsa.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
