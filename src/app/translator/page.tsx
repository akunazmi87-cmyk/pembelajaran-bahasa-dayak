
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Copy, 
  Loader2, 
  Play, 
  Pause, 
  Square,
  AlertCircle,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { translateDayakNgaju } from "@/ai/flows/dayak-ngaju-translator-flow";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { INITIAL_VOCABULARY } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TranslatorPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<{ indo: string; ngaju: string; source: 'database' | 'ai' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();
  const vocabQuery = useMemo(() => collection(firestore, "vocabulary"), [firestore]);
  const { data: dbVocab } = useCollection<any>(vocabQuery);

  const combinedVocab = useMemo(() => {
    return [...(dbVocab || []), ...INITIAL_VOCABULARY];
  }, [dbVocab]);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setAudioUrl(null);
    setAudioState('idle');

    try {
      const normalizedInput = inputText.toLowerCase().trim();
      const match = combinedVocab.find(v => v.indonesian.toLowerCase() === normalizedInput);
      
      if (match) {
        setResult({ 
          indo: inputText, 
          ngaju: match.ngaju, 
          source: 'database' 
        });
      } else {
        const res = await translateDayakNgaju({ text: inputText, targetLanguage: 'dayak-ngaju' });
        setResult({ 
          indo: inputText, 
          ngaju: res.translatedText, 
          source: res.source as 'database' | 'ai' 
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menerjemahkan" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTTS = async (text: string) => {
    if (audioUrl && audioState !== 'idle') {
      audioRef.current?.play();
      setAudioState('playing');
      return;
    }

    setIsAudioLoading(true);
    try {
      const res = await textToSpeech(text);
      setAudioUrl(res.media);
      setAudioState('playing');
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal memuat suara" });
    } finally {
      setIsAudioLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState('idle');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Berhasil disalin ke papan klip!" });
  };

  if (!mounted || authLoading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-headline font-bold text-primary">Penerjemah Bahasa Dayak Ngaju</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Terjemahkan kalimat dengan prioritas database lokal yang dikelola Admin.
        </p>
      </header>

      <div className="space-y-6">
        <Card className="shadow-2xl border-none overflow-hidden bg-white">
          <div className="h-2 bg-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              Input Terjemahan
            </CardTitle>
            <CardDescription>Masukkan teks Bahasa Indonesia untuk diterjemahkan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="Masukkan teks Bahasa Indonesia..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
              className="h-14 text-lg border-2 focus-visible:ring-primary shadow-inner"
            />
            <Button 
              className="w-full h-12 text-lg rounded-full font-bold shadow-lg"
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Terjemahkan"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {result.source === 'ai' && (
              <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="font-bold">Kosakata belum tersedia dalam database.</AlertTitle>
                <AlertDescription className="text-sm">
                  Hasil di bawah ini dihasilkan oleh AI dan mungkin memerlukan verifikasi guru atau penutur asli.
                </AlertDescription>
              </Alert>
            )}

            <Card className="shadow-2xl border-primary/20 bg-card">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bahasa Indonesia</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.indo)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xl font-medium">{result.indo}</p>
                </div>

                <div className="space-y-2 border-t pt-8">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Dayak Ngaju</span>
                      {result.source === 'database' ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] gap-1">
                          <Database className="w-3 h-3" /> Database Lokal
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Sparkles className="w-3 h-3" /> AI Gemini
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.ngaju)}>
                      <Copy className="w-4 h-4 text-primary" />
                    </Button>
                  </div>
                  
                  <p className="text-3xl font-headline font-bold text-primary leading-tight">
                    {result.ngaju}
                  </p>

                  <div className="flex items-center gap-4 pt-6 mt-6 border-t">
                    <Button 
                      onClick={() => handleTTS(result.ngaju)}
                      disabled={isAudioLoading}
                      variant={audioState === 'playing' ? "secondary" : "default"}
                      className="rounded-full gap-2 px-6 shadow-md"
                    >
                      {isAudioLoading ? <Loader2 className="animate-spin" /> : 
                       audioState === 'playing' ? <Pause /> : <Play />}
                      {audioState === 'playing' ? "Jeda" : "Dengarkan"}
                    </Button>
                    
                    {audioState !== 'idle' && (
                      <Button variant="outline" className="rounded-full h-10 w-10 p-0" onClick={stopAudio}>
                        <Square className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {audioUrl && (
                    <audio 
                      ref={audioRef} 
                      src={audioUrl} 
                      onEnded={() => setAudioState('idle')}
                      onPlay={() => setAudioState('playing')}
                      onPause={() => setAudioState('paused')}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
