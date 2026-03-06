
"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Volume2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONVERSATIONS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ConversationPage() {
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const logo = PlaceHolderImages.find(img => img.id === "logo-habaring-hurung");

  const playSingleAudio = (text: string) => {
    console.log(`Playing: ${text}`);
  };

  const playFullDialog = () => {
    setIsPlayingAll(true);
    console.log("Playing full conversation...");
    setTimeout(() => setIsPlayingAll(false), 5000);
  };

  if (!selectedTopic) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          {logo && (
            <Image 
              src={logo.imageUrl} 
              alt={logo.description} 
              width={50} 
              height={50} 
              className="object-contain"
              data-ai-hint={logo.imageHint}
            />
          )}
          <h1 className="text-4xl font-headline font-bold">Ruang Percakapan</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONVERSATIONS.map((topic) => (
            <Card 
              key={topic.id} 
              className="hover-lift cursor-pointer border-none shadow-md overflow-hidden"
              onClick={() => setSelectedTopic(topic)}
            >
              <div className="h-3 bg-primary" />
              <CardHeader>
                <CardTitle className="flex justify-between items-center font-headline">
                  {topic.title}
                  <Play className="w-5 h-5 text-primary" />
                </CardTitle>
                <p className="text-muted-foreground font-medium">{topic.dialogues.length} baris percakapan</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="gap-2 font-bold text-primary hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <div className="flex items-center gap-3">
          {logo && (
            <Image 
              src={logo.imageUrl} 
              alt={logo.description} 
              width={32} 
              height={32} 
              className="object-contain"
              data-ai-hint={logo.imageHint}
            />
          )}
          <h1 className="text-2xl font-headline font-bold">{selectedTopic.title}</h1>
        </div>
        <Button 
          variant="outline" 
          className="rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-white shadow-sm"
          onClick={playFullDialog}
          disabled={isPlayingAll}
        >
          <Play className={cn("w-4 h-4", isPlayingAll && "animate-pulse")} /> 
          Putar Semua
        </Button>
      </div>

      <div className="space-y-6 bg-card p-6 rounded-3xl shadow-lg border border-border">
        {selectedTopic.dialogues.map((dialog: any, index: number) => {
          const isOdd = index % 2 !== 0;
          return (
            <div 
              key={index} 
              className={cn(
                "flex flex-col gap-2",
                isOdd ? "items-end text-right" : "items-start text-left"
              )}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {!isOdd && <User className="w-3 h-3 text-primary" />}
                {dialog.speaker}
                {isOdd && <User className="w-3 h-3 text-primary" />}
              </div>
              
              <div className="flex items-end gap-2 max-w-[85%]">
                {!isOdd && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 hover:bg-primary/10 text-primary shadow-sm"
                    onClick={() => playSingleAudio(dialog.text)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
                
                <div className={cn(
                  "p-4 rounded-2xl relative shadow-md transition-all hover:scale-[1.02]",
                  isOdd 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted rounded-tl-none border border-border"
                )}>
                  <p className="text-lg font-bold">{dialog.text}</p>
                  <p className={cn(
                    "text-[10px] mt-1 uppercase tracking-widest font-bold opacity-80",
                    isOdd ? "text-primary-foreground" : "text-primary"
                  )}>
                    {dialog.language}
                  </p>
                </div>

                {isOdd && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 hover:bg-primary/10 text-primary shadow-sm"
                    onClick={() => playSingleAudio(dialog.text)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
