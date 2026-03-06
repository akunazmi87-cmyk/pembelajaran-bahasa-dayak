
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Volume2, Sparkles, ArrowLeftRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VOCABULARY } from "@/lib/data";
import { vocabularyContextualizer } from "@/ai/flows/vocabulary-contextualizer-flow";
import { translateDayakNgaju } from "@/ai/flows/dayak-ngaju-translator-flow";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function VocabularyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWord, setActiveWord] = useState<any>(null);
  const [examples, setExamples] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const logo = PlaceHolderImages.find(img => img.id === "logo-habaring-hurung");

  // Translator state
  const [translateText, setTranslateText] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<"dayak-ngaju" | "indonesian">("dayak-ngaju");

  const filteredVocab = useMemo(() => {
    return VOCABULARY.filter(v => 
      v.ngaju.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.indonesian.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleTranslate = async () => {
    if (!translateText.trim()) return;
    setIsTranslating(true);
    try {
      const result = await translateDayakNgaju({ text: translateText, targetLanguage: targetLang });
      setTranslatedResult(result.translatedText);
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menerjemahkan" });
    } finally {
      setIsTranslating(false);
    }
  };

  const generateExamples = async (word: string, translation: string) => {
    setIsGenerating(true);
    try {
      const result = await vocabularyContextualizer({ word, translation });
      setExamples(result.examples);
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal memuat contoh kalimat" });
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (word: string) => {
    console.log(`Playing audio for: ${word}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          {logo && (
            <Image 
              src={logo.imageUrl} 
              alt={logo.description} 
              width={60} 
              height={60} 
              className="object-contain"
              data-ai-hint={logo.imageHint}
            />
          )}
          <div>
            <h1 className="text-4xl font-headline font-bold mb-2">Ruang Kosakata</h1>
            <p className="text-muted-foreground">Cari dan pelajari ribuan kata dalam Bahasa Dayak Ngaju.</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Cari kata (Dayak atau Indonesia)..." 
            className="pl-10 rounded-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vocabulary List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVocab.map((item) => (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-all hover:border-primary shadow-sm ${activeWord?.id === item.id ? 'ring-2 ring-primary border-primary' : ''}`}
                onClick={() => {
                  setActiveWord(item);
                  setExamples([]);
                }}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary">{item.ngaju}</h3>
                    <p className="text-sm text-muted-foreground">{item.indonesian}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(item.ngaju);
                    }}
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredVocab.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-3xl border border-dashed">
              Kata tidak ditemukan. Coba kata lain!
            </div>
          )}
        </div>

        {/* Translation & AI Helper */}
        <div className="space-y-6">
          {/* AI Translator */}
          <Card className="shadow-lg border-none bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-headline font-bold text-xl flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" />
                  Penerjemah
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => setTargetLang(prev => prev === "dayak-ngaju" ? "indonesian" : "dayak-ngaju")}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                {targetLang === "dayak-ngaju" ? "Indonesia → Dayak Ngaju" : "Dayak Ngaju → Indonesia"}
              </div>

              <div className="space-y-3">
                <Input 
                  placeholder="Masukkan kalimat..." 
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  className="shadow-sm"
                />
                <Button 
                  className="w-full shadow-md" 
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  {isTranslating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Terjemahkan
                </Button>
              </div>

              {translatedResult && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-primary/20 shadow-inner">
                  <p className="text-sm font-bold text-primary mb-1">Hasil:</p>
                  <p className="text-lg font-medium">{translatedResult}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contextual Examples (AI) */}
          {activeWord && (
            <Card className="shadow-lg border-primary/20 bg-white">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-headline font-bold text-xl">Contoh Kalimat</h2>
                <p className="text-sm text-muted-foreground">
                  Ingin tahu bagaimana menggunakan kata <span className="font-bold text-primary">"{activeWord.ngaju}"</span>?
                </p>
                
                {examples.length > 0 ? (
                  <ul className="space-y-3">
                    {examples.map((ex, i) => (
                      <li key={i} className="p-3 bg-primary/5 rounded-lg text-sm italic border-l-4 border-primary shadow-sm">
                        "{ex}"
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-white shadow-sm"
                    onClick={() => generateExamples(activeWord.ngaju, activeWord.indonesian)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    Tampilkan Contoh (AI)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
