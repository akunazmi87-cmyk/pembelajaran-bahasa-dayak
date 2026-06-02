
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Volume2, 
  Copy, 
  Trash2, 
  History as HistoryIcon, 
  Loader2, 
  Play, 
  Pause, 
  Square,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { translateDayakNgaju } from "@/ai/flows/dayak-ngaju-translator-flow";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { cn } from "@/lib/utils";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<{ indo: string; ngaju: string; source: 'database' | 'ai' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();

  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { firestore } = initializeFirebase();

  // Load History from Firestore
  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, "translation_history"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(docs);
    });
    return () => unsubscribe();
  }, [firestore]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setAudioUrl(null);
    setAudioState('idle');

    try {
      const res = await translateDayakNgaju({ text: inputText, targetLanguage: 'dayak-ngaju' });
      const newResult = { 
        indo: inputText, 
        ngaju: res.translatedText, 
        source: res.source as 'database' | 'ai' 
      };
      setResult(newResult);

      // Save to History
      if (firestore) {
        addDoc(collection(firestore, "translation_history"), {
          ...newResult,
          timestamp: Timestamp.now()
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-headline font-bold text-primary">Penerjemah Bahasa Dayak Ngaju</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Membantu siswa dan pemandu sekolah berkomunikasi dengan tamu dalam Bahasa Dayak Ngaju yang santun.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Translator Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-2xl border-none overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Input Terjemahan
              </CardTitle>
              <CardDescription>Masukkan teks Bahasa Indonesia untuk diterjemahkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Masukkan teks Bahasa Indonesia... (Contoh: Selamat pagi)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
                className="h-14 text-lg border-2 focus-visible:ring-primary shadow-inner"
              />
              <Button 
                className="w-full h-12 text-lg rounded-full font-bold shadow-lg transition-transform active:scale-95"
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Terjemahkan"}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 shadow-2xl border-primary/20 bg-card/50 backdrop-blur-sm">
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
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Dayak Ngaju</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        result.source === 'database' ? "bg-primary text-white" : "bg-amber-200 text-amber-800"
                      )}>
                        {result.source === 'database' ? "Terjemahan Database" : "Terjemahan AI"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.ngaju)}>
                        <Copy className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-3xl font-headline font-bold text-primary leading-tight">
                    {result.ngaju}
                  </p>

                  {result.source === 'ai' && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 font-bold bg-amber-50 p-2 rounded-lg mt-4 border border-amber-200">
                      <AlertCircle className="w-4 h-4" />
                      Hasil AI mungkin memerlukan verifikasi guru atau penutur asli.
                    </div>
                  )}

                  {/* Audio Controls */}
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
          )}
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-lg border-none bg-white h-[calc(100vh-200px)] sticky top-24 flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4" />
                  Riwayat
                </CardTitle>
                <CardDescription>20 terjemahan terakhir</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4">
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground italic text-sm">
                    Belum ada riwayat terjemahan.
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setInputText(item.indonesian);
                        setResult({ indo: item.indonesian, ngaju: item.ngaju, source: item.source });
                      }}
                      className="p-3 rounded-xl border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
                    >
                      <p className="text-xs text-muted-foreground truncate">{item.indonesian}</p>
                      <p className="font-bold text-primary truncate group-hover:text-primary-700">{item.ngaju}</p>
                      <div className="flex justify-between items-center mt-1">
                         <span className="text-[9px] uppercase font-bold text-muted-foreground">
                           {item.source === 'database' ? 'DB' : 'AI'}
                         </span>
                         <span className="text-[9px] text-muted-foreground">
                           {new Date(item.timestamp?.seconds * 1000).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
