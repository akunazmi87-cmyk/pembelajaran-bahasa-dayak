
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Trophy, 
  Lightbulb, 
  RotateCcw, 
  ArrowRight, 
  Star, 
  Loader2,
  CheckCircle2,
  Zap,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_VOCABULARY } from "@/lib/data";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

// Game Constants (Local)
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
  const [hintsLeft, setHintsLeft] = useState(3);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  
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

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Memuat game...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Poin</p>
                <p className="text-2xl font-headline font-bold text-primary">{points}</p>
              </div>
            </div>
            {streak > 0 && (
              <div className="flex flex-col items-center">
                <Zap className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                <span className="text-[10px] font-bold text-orange-500">{streak}x</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-none shadow-sm md:col-span-2">
          <CardContent className="p-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Level</p>
                <p className="text-lg font-headline font-bold text-primary">{currentLevelInfo.label}</p>
              </div>
              {nextLevelInfo && (
                <p className="text-xs font-bold text-muted-foreground">
                  {nextLevelInfo.min - points} poin lagi ke {nextLevelInfo.label}
                </p>
              )}
            </div>
            <Progress value={progressValue} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-none overflow-hidden bg-white">
          <div className="h-2 bg-primary" />
          <CardHeader className="text-center relative">
            <CardTitle className="text-xl text-muted-foreground pt-4">Susun Kata Ini:</CardTitle>
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
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex gap-4 p-8 pt-0">
            {isCorrect === true ? (
              <Button 
                className="w-full h-14 text-lg rounded-full gap-2 shadow-lg"
                onClick={nextLevel}
              >
                Kata Selanjutnya <ArrowRight className="w-5 h-5" />
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
    </div>
  );
}
