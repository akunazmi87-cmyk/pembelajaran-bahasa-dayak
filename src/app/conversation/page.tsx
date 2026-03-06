"use client";

import { useState } from "react";
import { Play, Volume2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONVERSATIONS } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ConversationPage() {
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

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
        <h1 className="text-4xl font-headline font-bold mb-8">Ruang Percakapan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONVERSATIONS.map((topic) => (
            <Card 
              key={topic.id} 
              className="hover-lift cursor-pointer border-none shadow-md overflow-hidden"
              onClick={() => setSelectedTopic(topic)}
            >
              <div className="h-3 bg-primary" />
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {topic.title}
                  <Play className="w-5 h-5 text-primary" />
                </CardTitle>
                <p className="text-muted-foreground">{topic.dialogues.length} baris percakapan</p>
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
        <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <h1 className="text-2xl font-headline font-bold">{selectedTopic.title}</h1>
        <Button 
          variant="outline" 
          className="rounded-full gap-2 border-primary text-primary"
          onClick={playFullDialog}
          disabled={isPlayingAll}
        >
          <Play className={cn("w-4 h-4", isPlayingAll && "animate-pulse")} /> 
          Putar Semua
        </Button>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-3xl shadow-lg border border-border">
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
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                {!isOdd && <User className="w-3 h-3" />}
                {dialog.speaker}
                {isOdd && <User className="w-3 h-3" />}
              </div>
              
              <div className="flex items-end gap-2 max-w-[85%]">
                {!isOdd && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 hover:bg-primary/10 text-primary"
                    onClick={() => playSingleAudio(dialog.text)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
                
                <div className={cn(
                  "p-4 rounded-2xl relative",
                  isOdd 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted rounded-tl-none"
                )}>
                  <p className="text-lg font-medium">{dialog.text}</p>
                  <p className={cn(
                    "text-[10px] mt-1 uppercase tracking-widest opacity-70",
                    isOdd ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {dialog.language}
                  </p>
                </div>

                {isOdd && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 hover:bg-primary/10 text-primary"
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
