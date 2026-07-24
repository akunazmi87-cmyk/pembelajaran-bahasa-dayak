
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Volume2, Sparkles, ArrowLeftRight, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vocabularyContextualizer } from "@/ai/flows/vocabulary-contextualizer-flow";
import { translateDayakNgaju } from "@/ai/flows/dayak-ngaju-translator-flow";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { INITIAL_VOCABULARY } from "@/lib/data";

const ITEMS_PER_PAGE = 24;

export default function VocabularyPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<any>(null);
  const [examples, setExamples] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { toast } = useToast();

  const firestore = useFirestore();
  const vocabQuery = useMemo(() => collection(firestore, "vocabulary"), [firestore]);
  const { data: vocabFromDb, loading: dbLoading } = useCollection<any>(vocabQuery);

  const [translateText, setTranslateText] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<"dayak-ngaju" | "indonesian">("dayak-ngaju");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search query to prevent lag on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const combinedVocab = useMemo(() => {
    if (!mounted) return [];
    const dbWords = vocabFromDb || [];
    const dbIds = new Set(dbWords.map(w => `${w.ngaju}-${w.indonesian}`.toLowerCase()));
    const staticWords = INITIAL_VOCABULARY.filter(w => !dbIds.has(`${w.ngaju}-${w.indonesian}`.toLowerCase()));
    return [...dbWords, ...staticWords];
  }, [vocabFromDb, mounted]);

  const categories = useMemo(() => {
    const cats = new Set(combinedVocab.map(v => v.category));
    return Array.from(cats).sort();
  }, [combinedVocab]);

  const filteredVocab = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return combinedVocab.filter(v => {
      const matchesSearch = !query || 
                           v.ngaju?.toLowerCase().includes(query) || 
                           v.indonesian?.toLowerCase().includes(query);
      const matchesCategory = selectedCategory ? v.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.ngaju.localeCompare(b.ngaju));
  }, [debouncedSearch, selectedCategory, combinedVocab]);

  const visibleVocab = useMemo(() => {
    return filteredVocab.slice(0, visibleCount);
  }, [filteredVocab, visibleCount]);

  const handleTranslate = async () => {
    if (!translateText.trim()) return;
    setIsTranslating(true);
    try {
      const normalizedInput = translateText.toLowerCase().trim();
      let match = combinedVocab.find(v => 
        targetLang === "dayak-ngaju" 
          ? v.indonesian.toLowerCase() === normalizedInput
          : v.ngaju.toLowerCase() === normalizedInput
      );

      if (match) {
        setTranslatedResult(targetLang === "dayak-ngaju" ? match.ngaju : match.indonesian);
      } else {
        const result = await translateDayakNgaju({ text: translateText, targetLanguage: targetLang });
        setTranslatedResult(result.translatedText);
      }
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

  const playAudio = (word: any) => {
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play().catch(() => toast({ title: "Audio tidak dapat diputar", variant: "destructive" }));
    } else {
      toast({ title: "Audio pelafalan belum tersedia untuk kata ini." });
    }
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2 text-primary">Ruang Kosakata</h1>
          <p className="text-muted-foreground">Pelajari kata-kata dasar dari database dinamis.</p>
        </div>
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

      <div className="flex flex-wrap gap-2 mb-8">
        <Button 
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => {
            setSelectedCategory(null);
            setVisibleCount(ITEMS_PER_PAGE);
          }}
          className="rounded-full"
          size="sm"
        >
          Semua
        </Button>
        {categories.map(cat => (
          <Button 
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => {
              setSelectedCategory(cat);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="rounded-full"
            size="sm"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dbLoading ? (
              <div className="col-span-full py-20 text-center">
                <Loader2 className="animate-spin inline-block h-8 w-8 text-primary" />
                <p className="mt-2 text-muted-foreground">Memuat database...</p>
              </div>
            ) : filteredVocab.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground italic bg-muted/20 rounded-3xl">
                Kosakata tidak ditemukan.
              </div>
            ) : (
              visibleVocab.map((item, idx) => (
                <Card 
                  key={`${item.ngaju}-${idx}`} 
                  className={`cursor-pointer transition-all hover:border-primary shadow-sm ${activeWord?.ngaju === item.ngaju ? 'ring-2 ring-primary border-primary' : ''}`}
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
                        playAudio(item);
                      }}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredVocab.length > visibleCount && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="gap-2 rounded-full border-primary text-primary hover:bg-primary/5 px-8"
              >
                <ChevronDown className="w-4 h-4" />
                Tampilkan Lebih Banyak ({filteredVocab.length - visibleCount} lagi)
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-none bg-primary/5 sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-headline font-bold text-xl flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" />
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
                <h2 className="font-headline font-bold text-xl text-primary">Konteks Kalimat</h2>
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
