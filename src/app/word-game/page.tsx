
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Trophy, 
  Lightbulb, 
  RotateCcw, 
  ArrowRight, 
  Star, 
  Medal, 
  AlertTriangle,
  Users,
  Loader2,
  CheckCircle2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  useFirestore, 
  useUser,
  useCollection
} from "@/firebase";
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
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

const BADGES = [
  { points: 10, label: "Pemula Bahasa", icon: "🏅" },
  { points: 50, label: "Pemburu Kosakata", icon: "🏅" },
  { points: 100, label: "Ahli Susun Kata", icon: "🏅" },
  { points: 150, label: "Raja Kosakata", icon: "🏅" },
  { points: 200, label: "Master Bahasa Dayak Ngaju", icon: "🏆" },
];

export default function WordGamePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  // Master Vocabulary from Firestore
  const vocabQuery = useMemo(() => collection(firestore, "vocabulary"), [firestore]);
  const { data: vocabList, loading: vocabLoading } = useCollection<any>(vocabQuery);

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
  const [usedWordIds, setUsedWordIds] = useState<string[]>([]);
  
  // Profile State
  const [highScore, setHighScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch/Sync Profile
  useEffect(() => {
    if (!user || !firestore) {
      if (!userLoading) setIsLoadingProfile(false);
      return;
    }

    const docRef = doc(firestore, "game_profiles", user.uid);
    const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPoints(data.totalPoints || 0);
        setHighScore(data.highScore || 0);
        setBadges(data.badges || []);
      }
      setIsLoadingProfile(false);
    });

    const q = query(collection(firestore, "game_profiles"), orderBy("totalPoints", "desc"), limit(10));
    const unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
      const topPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(topPlayers);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeLeaderboard();
    };
  }, [user, firestore, userLoading]);

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
    if (vocabList.length === 0) return;
    
    let availableWords = vocabList.filter(v => !usedWordIds.includes(v.id));
    if (availableWords.length === 0) {
      availableWords = vocabList;
      setUsedWordIds([]);
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const wordObj = availableWords[randomIndex];
    
    setCurrentWord(wordObj);
    setScrambled(scrambleWord(wordObj.ngaju));
    setUserInput([]);
    setIsCorrect(null);
    setUsedWordIds(prev => [...prev, wordObj.id]);
  }, [usedWordIds, vocabList]);

  useEffect(() => {
    if (vocabList.length > 0 && !currentWord) {
      nextLevel();
    }
  }, [currentWord, nextLevel, vocabList]);

  // Browser Exit Confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (userInput.length > 0 && isCorrect === null) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [userInput, isCorrect]);

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

  const resetInput = () => {
    if (isCorrect === true) return;
    setScrambled(scrambleWord(currentWord.ngaju));
    setUserInput([]);
    setIsCorrect(null);
  };

  const useHint = () => {
    if (hintsLeft <= 0 || isCorrect !== null) return;
    
    setHintsLeft(prev => prev - 1);
    const correctLetter = currentWord.ngaju[userInput.length].toUpperCase();
    const letterIndex = scrambled.indexOf(correctLetter);
    
    if (letterIndex > -1) {
      handleLetterClick(correctLetter, letterIndex);
    }
  };

  const handleWin = async () => {
    const wordLen = currentWord.ngaju.length;
    let basePoints = 1;
    if (wordLen >= 6 && wordLen <= 8) basePoints = 2;
    if (wordLen >= 9) basePoints = 3;

    const newStreak = streak + 1;
    setStreak(newStreak);

    let bonus = 0;
    if (newStreak === 5) bonus = 5;
    if (newStreak === 10) bonus = 10;

    const earnedPoints = basePoints + bonus;
    const newPoints = points + earnedPoints;
    setPoints(newPoints);
    
    if (bonus > 0) {
      toast({
        title: "🔥 Streak Bonus!",
        description: `Benar ${newStreak} kali berturut-turut! +${bonus} bonus poin.`,
      });
    }

    let newBadges = [...badges];
    let badgeAdded = false;
    BADGES.forEach(b => {
      if (newPoints >= b.points && !newBadges.includes(b.label)) {
        newBadges.push(b.label);
        badgeAdded = true;
      }
    });

    if (badgeAdded) {
      toast({
        title: "🎉 Badge Baru!",
        description: `Hebat! Kamu mendapatkan badge baru.`,
      });
    }

    if (user && firestore) {
      const currentLevelObj = [...LEVELS].reverse().find(l => newPoints >= l.min) || LEVELS[0];
      setDoc(doc(firestore, "game_profiles", user.uid), {
        displayName: user.displayName || "Siswa Dayak",
        totalPoints: newPoints,
        level: currentLevelObj.label,
        highScore: Math.max(newPoints, highScore),
        badges: newBadges,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  };

  const currentLevelInfo = useMemo(() => {
    return [...LEVELS].reverse().find(l => points >= l.min) || LEVELS[0];
  }, [points]);

  const nextLevelInfo = useMemo(() => {
    return LEVELS.find(l => l.min > points);
  }, [points]);

  const progressValue = useMemo(() => {
    if (!nextLevelInfo) return 100;
    const prevMin = LEVELS.find(l => l.min <= points && l.min >= currentLevelInfo.min)?.min || 0;
    const range = nextLevelInfo.min - prevMin;
    const current = points - prevMin;
    return (current / range) * 100;
  }, [points, currentLevelInfo, nextLevelInfo]);

  if (userLoading || isLoadingProfile || vocabLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Menghubungkan ke Pusat Kosakata...</p>
      </div>
    );
  }

  if (vocabList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
         <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Database Kosakata Kosong</h1>
            <p className="text-muted-foreground mb-6">Silakan hubungi Admin atau buka halaman Admin untuk mengisi data.</p>
            <Button asChild><a href="/admin">Buka Admin</a></Button>
         </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Trophy className="text-primary w-6 h-6" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-2xl border-none overflow-hidden bg-white">
            <div className="h-2 bg-primary" />
            <CardHeader className="text-center relative">
              {currentWord?.category && (
                <Badge variant="secondary" className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none">
                  {currentWord.category}
                </Badge>
              )}
              <CardTitle className="text-xl text-muted-foreground pt-4">Susun Kata Ini:</CardTitle>
              <CardDescription className="text-3xl font-bold text-foreground">
                "{currentWord?.indonesian}"
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
                {currentWord?.ngaju.split("").map((char: string, i: number) => {
                  const isSpace = char === " ";
                  return (
                    <div 
                      key={i}
                      className={cn(
                        "w-10 h-12 md:w-12 md:h-14 border-2 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold transition-all",
                        isSpace ? "border-none bg-transparent" : (userInput[i] ? "border-primary bg-primary/5 text-primary scale-105" : "border-dashed border-muted"),
                        isCorrect === true && !isSpace && "border-primary bg-primary/10 text-primary",
                        isCorrect === false && !isSpace && "border-destructive bg-destructive/5 text-destructive"
                      )}
                    >
                      {userInput[i]}
                    </div>
                  );
                })}
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
                    {letter === " " ? "_" : letter}
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
                  <p className="text-sm">+{currentWord.ngaju.length >= 9 ? 3 : currentWord.ngaju.length >= 6 ? 2 : 1} Poin</p>
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
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-full border-primary text-primary hover:bg-primary/5"
                    onClick={resetInput}
                    disabled={userInput.length === 0}
                  >
                    <RotateCcw className="mr-2 w-4 h-4" /> Reset
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 h-12 rounded-full"
                    onClick={useHint}
                    disabled={hintsLeft === 0}
                  >
                    <Lightbulb className="mr-2 w-4 h-4" /> Petunjuk ({hintsLeft})
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>

          <Card className="border-none shadow-lg bg-white/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Medal className="text-primary w-5 h-5" />
                Pencapaian Kamu
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {badges.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Belum ada badge. Terus bermain untuk mendapatkannya!</p>
              ) : (
                badges.map((b, i) => (
                  <Badge key={i} className="py-2 px-4 rounded-full text-xs gap-2 bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105">
                    <span>{BADGES.find(badge => badge.label === b)?.icon || "🏅"}</span>
                    {b}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg sticky top-24 bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="text-primary w-5 h-5" />
                Papan Peringkat
              </CardTitle>
              <CardDescription>10 Pemain Terbaik</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-1">
                {leaderboard.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground italic">Belum ada pemain.</p>
                ) : (
                  leaderboard.map((player, i) => (
                    <div 
                      key={player.id} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl transition-colors",
                        player.id === user?.uid ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-6 text-center font-bold",
                          i === 0 ? "text-yellow-600" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm truncate max-w-[100px]">{player.displayName}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">{player.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-headline font-bold text-primary">{player.totalPoints}</p>
                        <p className="text-[9px] text-muted-foreground font-bold">PTS</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari permainan?</AlertDialogTitle>
            <AlertDialogDescription>
              Progres soal saat ini akan direset. Poin total dan badge Anda tetap aman.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>Lanjut Bermain</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowExitDialog(false);
                if (pendingPath) router.push(pendingPath);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
