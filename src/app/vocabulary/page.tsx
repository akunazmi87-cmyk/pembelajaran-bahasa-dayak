
"use client";

import { useState, useMemo } from "react";
import { Search, Volume2, Sparkles, ArrowLeftRight, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vocabularyContextualizer } from "@/ai/flows/vocabulary-contextualizer-flow";
import { translateDayakNgaju } from "@/ai/flows/dayak-ngaju-translator-flow";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";

export default function VocabularyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<any>(null);
  const [examples, setExamples] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Fetch vocabulary from Firestore
  const vocabQuery = useMemo(() => collection(firestore, "vocabulary"), [firestore]);
  const { data: vocabList, loading: vocabLoading } = useCollection<any>(vocabQuery);

  // Translation state
  const [translateText, setTranslateText] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<"dayak-ngaju" | "indonesian">("dayak-ngaju");

  const categories = useMemo(() => {
    const cats = new Set(vocabList.map(v => v.category));
    return Array.from(cats);
  }, [vocabList]);

  const filteredVocab = useMemo(() => {
    return vocabList.filter(v => {
      const matchesSearch = v.ngaju.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.indonesian.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? v.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [vocabList, searchQuery, selectedCategory]);

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
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2">Ruang Kosakata</h1>
          <p className="text-muted-foreground">Pelajari {vocabList.length} kata dalam Bahasa Dayak Ngaju.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Cari kata..." 
              className="pl-10 rounded-full shadow-sm bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button 
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="rounded-full"
          size="sm"
        >
          Semua
        </Button>
        {categories.map(cat => (
          <Button 
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full"
            size="sm"
          >
            {cat} ({vocabList.filter(v => v.category === cat).length})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {vocabLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
          ) : (
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
                      <Badge variant="secondary" className="mt-2 text-[10px] uppercase font-bold">{item.category}</Badge>
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
          )}
          {filteredVocab.length === 0 && !vocabLoading && (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-3xl border border-dashed">
              Kata tidak ditemukan. Coba kata lain atau pilih kategori berbeda.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-none bg-primary/5 sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-headline font-bold text-xl flex items-center gap-2">
                  <Sparkles className="text-primary w-5 h-5" />
                  Penerjemah Cepat
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
                  className="bg-white"
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

            {activeWord && (
              <div className="p-6 border-t border-primary/10 space-y-4">
                <h2 className="font-headline font-bold text-xl">Konteks Kalimat</h2>
                <p className="text-sm text-muted-foreground">
                  Ingin tahu cara pakai <span className="font-bold text-primary">"{activeWord.ngaju}"</span>?
                </p>
                
                {examples.length > 0 ? (
                  <ul className="space-y-3">
                    {examples.map((ex, i) => (
                      <li key={i} className="p-3 bg-white rounded-lg text-sm italic border-l-4 border-primary shadow-sm">
                        "{ex}"
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => generateExamples(activeWord.ngaju, activeWord.indonesian)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    Tampilkan Contoh (AI)
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
