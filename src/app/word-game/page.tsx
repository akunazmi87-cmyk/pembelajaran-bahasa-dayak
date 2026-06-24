
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  Zap,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_VOCABULARY } from "@/lib/data";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

// Game Constants
const LEVELS = [
  { min: 0, label: "Pemula" },
  { min: 10, label: "Amatir" },
  { min: 20, label: "Menengah" },
  { min: 35, label: "Mahir" },
  { min: 50, label: "Ahli" },
  { min: 75, label: "Profesional" },
  { min: 100, label: "Juara Bahasa" },
  { min: 150, label: "Legenda Bahasa" },
  { min: 200, label: "Master Bahasa Dayak Ngaju" },
];

export default function WordGamePage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Game State
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scramble Logic
  const scrambleWord = (word: string) => {
    const arr = word.toUpperCase().split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join("") === word.toUpperCase() && word.length > 1) {
      return scrambleWord(word);
    }
    return arr;
  };

  const nextLevel = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * INITIAL_VOCABULARY.length);
    const wordObj = INITIAL_VOCABULARY[randomIndex];
    
    setCurrentWord(wordObj);
    setScrambled(scrambleWord(wordObj.ngaju));
    setUserInput([]);
    setIsCorrect(null);
  }, []);

  useEffect(() => {
    if (mounted && !currentWord) {
      nextLevel();
    }
  }, [mounted, currentWord, nextLevel]);

  const handleLetterClick = (letter: string, index: number) => {
    if (isCorrect !== null) return;
    
    const newInput = [...userInput, letter];
    setUserInput(newInput);

    const newScrambled = [...scrambled];
    newScrambled.splice(index, 1);
    setScrambled(newScrambled);

    if (newInput.length === currentWord.ngaju.length) {
      const finalWord = newInput.join("");
      if (finalWord === currentWord.ngaju.toUpperCase()) {
        setIsCorrect(true);
        handleWin();
      } else {
        setIsCorrect(false);
        setStreak(0);
      }
    }
  };

  const handleWin = () => {
    const wordLen = currentWord.ngaju.length;
    let earned = wordLen >= 9 ? 3 : wordLen >= 6 ? 2 : 1;
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    if (newStreak % 5 === 0) {
      earned += 5;
      toast({ title: "🔥 Streak Bonus!", description: `+5 bonus poin!` });
    }

    setPoints(prev => prev + earned);
  };

  const resetInput = () => {
    if (isCorrect === true) return;
    setScrambled(scrambleWord(currentWord.ngaju));
    setUserInput([]);
    setIsCorrect(null);
  };

  const currentLevelInfo = useMemo(() => {
    return [...LEVELS].reverse().find(l => points >= l.min) || LEVELS[0];
  }, [points]);

  const nextLevelInfo = useMemo(() => {
    return LEVELS.find(l => l.min > points);
  }, [points]);

  const progressValue = useMemo(() => {
    if (!nextLevelInfo) return 100;
    const currentMin = currentLevelInfo.min;
    const range = nextLevelInfo.min - currentMin;
    const current = points - currentMin;
    return (current / range) * 100;
  }, [points, currentLevelInfo, nextLevelInfo]);

  const handleExit = () => {
    setShowExitDialog(true);
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={handleExit} className="text-muted-foreground">
          Keluar Game
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-primary font-bold px-3 py-1">
            {currentLevelInfo.label}
          </Badge>
          <div className="flex items-center gap-1 font-bold text-primary">
            <Trophy className="w-5 h-5" />
            {points}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>Progress Level</span>
            {nextLevelInfo && <span>{nextLevelInfo.min - points} poin lagi ke {nextLevelInfo.label}</span>}
          </div>
          <Progress value={progressValue} className="h-2 shadow-inner" />
        </div>

        <Card className="shadow-2xl border-none overflow-hidden bg-white">
          <div className="h-2 bg-primary" />
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-muted-foreground pt-4">Susun Kosakata {currentWord?.category}:</CardTitle>
            <CardDescription className="text-3xl font-bold text-foreground">
              "{currentWord?.indonesian}"
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
              {currentWord?.ngaju.split("").map((char: string, i: number) => (
                <div 
                  key={i}
                  className={cn(
                    "w-10 h-12 md:w-12 md:h-14 border-2 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold transition-all",
                    userInput[i] ? "border-primary bg-primary/5 text-primary scale-105" : "border-dashed border-muted",
                    isCorrect === true && "border-primary bg-primary/10 text-primary",
                    isCorrect === false && "border-destructive bg-destructive/5 text-destructive"
                  )}
                >
                  {userInput[i]}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {scrambled.map((letter, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-12 h-14 md:w-14 md:h-16 text-xl md:text-2xl font-bold rounded-2xl shadow-md transition-all bg-white border-2 border-primary/20 hover:border-primary text-primary"
                  onClick={() => handleLetterClick(letter, i)}
                  disabled={isCorrect !== null}
                >
                  {letter}
                </Button>
              ))}
            </div>

            {isCorrect === false && (
              <div className="flex items-center justify-center gap-2 text-destructive font-bold animate-bounce">
                <AlertTriangle className="w-5 h-5" />
                Salah! Ayo coba lagi.
              </div>
            )}

            {isCorrect === true && (
              <div className="flex flex-col items-center justify-center gap-2 text-primary font-bold animate-pulse">
                <div className="flex items-center gap-2 text-2xl">
                  <CheckCircle2 className="w-8 h-8" />
                  Bagus Sekali!
                </div>
                {streak > 0 && <span className="text-orange-500 flex items-center gap-1"><Zap className="w-4 h-4 fill-current"/> {streak} Streak!</span>}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex gap-4 p-8 pt-0">
            {isCorrect === true ? (
              <Button 
                className="w-full h-14 text-lg rounded-full gap-2 shadow-lg"
                onClick={nextLevel}
              >
                Lanjut <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-full border-primary text-primary hover:bg-primary/5"
                onClick={resetInput}
                disabled={userInput.length === 0}
              >
                <RotateCcw className="mr-2 w-4 h-4" /> Reset Huruf
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin ingin keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua progres permainan yang sedang berlangsung dalam sesi ini akan direset. Poin total yang sudah tersimpan tetap aman.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>Lanjut Bermain</Button>
            <AlertDialogAction onClick={() => router.push("/")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
