
"use client";

import { useState } from "react";
import { Play, Volume2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <h1 className="text-4xl font-headline font-bold mb-2">Ruang Percakapan</h1>
        <p className="text-muted-foreground mb-8">Pilih topik percakapan untuk mulai belajar dialog sehari-hari.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONVERSATIONS.map((topic) => (
            <Card 
              key={topic.id} 
              className="hover-lift cursor-pointer border-none shadow-md overflow-hidden flex flex-col"
              onClick={() => setSelectedTopic(topic)}
            >
              <div className="h-2 bg-primary" />
              <CardHeader className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30">
                    {topic.category}
                  </Badge>
                  <Play className="w-4 h-4 text-primary opacity-50" />
                </div>
                <CardTitle className="text-xl font-headline">
                  {topic.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground font-medium">{topic.dialogues.length} baris percakapan</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="gap-2 font-bold text-primary hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
          <div>
            <Badge variant="outline" className="mb-1 text-[10px] uppercase">{selectedTopic.category}</Badge>
            <h1 className="text-2xl font-headline font-bold">{selectedTopic.title}</h1>
          </div>
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

      <div className="space-y-6 bg-card p-6 md:p-10 rounded-3xl shadow-lg border border-border">
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
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {!isOdd && <User className="w-3 h-3 text-primary" />}
                {dialog.speaker}
                {isOdd && <User className="w-3 h-3 text-primary" />}
              </div>
              
              <div className={cn("flex items-end gap-2 max-w-[85%]", isOdd && "flex-row-reverse")}>
                <div className={cn(
                  "p-4 rounded-2xl relative shadow-md transition-all hover:scale-[1.02]",
                  isOdd 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted rounded-tl-none border border-border"
                )}>
                  <p className="text-lg font-medium leading-relaxed">{dialog.text}</p>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-8 w-8 hover:bg-primary/10 text-primary shrink-0 shadow-sm"
                  onClick={() => playSingleAudio(dialog.text)}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
