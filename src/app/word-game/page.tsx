
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
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VOCABULARY } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  useFirestore, 
  useUser 
} from "@/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
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

  // Game State
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  
  // Profile State
  const [highScore, setHighScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch/Sync Profile
  useEffect(() => {
    if (!user || !firestore) return;

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const docRef = doc(firestore, "game_profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPoints(data.totalPoints || 0);
          setHighScore(data.highScore || 0);
          setBadges(data.badges || []);
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    fetchLeaderboard();
  }, [user, firestore]);

  const fetchLeaderboard = async () => {
    if (!firestore) return;
    const q = query(collection(firestore, "game_profiles"), orderBy("totalPoints", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const topPlayers = querySnapshot.docs.map(doc => doc.data());
    setLeaderboard(topPlayers);
  };

  // Exit Confirmation Logic
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const scrambleWord = (word: string) => {
    const arr = word.toUpperCase().split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure it's actually scrambled
    if (arr.join("") === word.toUpperCase() && word.length > 1) {
      return scrambleWord(word);
    }
    return arr;
  };

  const nextLevel = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * VOCABULARY.length);
    const wordObj = VOCABULARY[randomIndex];
    setCurrentWord(wordObj);
    setScrambled(scrambleWord(wordObj.ngaju));
    setUserInput([]);
    setIsCorrect(null);
  }, []);

  useEffect(() => {
    if (VOCABULARY.length > 0 && !currentWord) {
      nextLevel();
    }
  }, [currentWord, nextLevel]);

  const handleLetterClick = (letter: string, index: number) => {
    if (isCorrect !== null) return;
    
    // Add to input
    const newInput = [...userInput, letter];
    setUserInput(newInput);

    // Remove from scrambled (just by index to handle duplicates)
    const newScrambled = [...scrambled];
    newScrambled.splice(index, 1);
    setScrambled(newScrambled);

    // Check if finished
    if (newInput.length === currentWord.ngaju.length) {
      const finalWord = newInput.join("");
      if (finalWord === currentWord.ngaju.toUpperCase()) {
        setIsCorrect(true);
        handleWin();
      } else {
        setIsCorrect(false);
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
    
    // Auto-fill one letter
    const newLetter = correctLetter;
    const letterIndex = scrambled.indexOf(newLetter);
    
    if (letterIndex > -1) {
      handleLetterClick(newLetter, letterIndex);
    }
  };

  const handleWin = async () => {
    const newPoints = points + 2;
    setPoints(newPoints);
    
    // Update Badge & Highscore
    let newBadges = [...badges];
    BADGES.forEach(b => {
      if (newPoints >= b.points && !newBadges.includes(b.label)) {
        newBadges.push(b.label);
        toast({
          title: "🎉 Badge Baru Diperoleh!",
          description: `Selamat! Kamu mendapatkan badge: ${b.label}`,
        });
      }
    });
    setBadges(newBadges);

    if (newPoints > highScore) {
      setHighScore(newPoints);
    }

    // Save to Firestore
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

  if (userLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Trophy className="text-primary w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Total Poin</p>
              <p className="text-2xl font-headline font-bold text-primary">{points}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-none shadow-sm md:col-span-2">
          <CardContent className="p-4">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Level Saat Ini</p>
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
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-2xl border-none overflow-hidden bg-card">
            <div className="h-2 bg-primary" />
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-muted-foreground">Susun Kata Ini:</CardTitle>
              <CardDescription className="text-2xl font-bold text-foreground">
                "{currentWord?.indonesian}"
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Answer Area */}
              <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
                {currentWord?.ngaju.split("").map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-10 h-12 md:w-12 md:h-14 border-2 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold transition-all",
                      userInput[i] ? "border-primary bg-primary/5 text-primary scale-105" : "border-dashed border-muted",
                      isCorrect === true && "border-green-600 bg-green-50 text-green-700",
                      isCorrect === false && "border-destructive bg-destructive/5 text-destructive"
                    )}
                  >
                    {userInput[i]}
                  </div>
                ))}
              </div>

              {/* Scrambled Letters */}
              <div className="flex flex-wrap justify-center gap-3">
                {scrambled.map((letter, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-12 h-14 md:w-14 md:h-16 text-xl md:text-2xl font-bold rounded-2xl shadow-md hover:scale-110 active:scale-95 transition-all"
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
                <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-xl animate-pulse">
                  <CheckCircle2 className="w-6 h-6" />
                  Luar Biasa! +2 Poin
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

          {/* Badges Section */}
          <Card className="border-none shadow-lg">
            <CardHeader>
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
                  <Badge key={i} className="py-2 px-4 rounded-full text-sm gap-2 bg-primary text-primary-foreground shadow-md">
                    <span>{BADGES.find(badge => badge.label === b)?.icon}</span>
                    {b}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Leaderboard */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="text-primary w-5 h-5" />
                Papan Peringkat
              </CardTitle>
              <CardDescription>10 Pemain Terbaik</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-1">
                {leaderboard.map((player, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-colors",
                      player.displayName === user?.displayName ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
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
                        <p className="font-bold text-sm truncate max-w-[120px]">{player.displayName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{player.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-headline font-bold text-primary">{player.totalPoints}</p>
                      <p className="text-[10px] text-muted-foreground">PTS</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin ingin keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Progres permainan yang sedang berlangsung pada kata ini akan direset. Poin total dan badge Anda tetap aman.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>Lanjut Bermain</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowExitDialog(false);
                if (pendingPath) router.push(pendingPath);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
