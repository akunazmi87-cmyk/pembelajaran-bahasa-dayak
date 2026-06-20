
"use client";

import { useState, useMemo, useEffect } from "react";
import { Trophy, CheckCircle2, XCircle, ArrowRight, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";

export default function ChallengePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const firestore = useFirestore();
  const vocabQuery = useMemo(() => collection(firestore, "vocabulary"), [firestore]);
  const { data: vocabList, loading } = useCollection<any>(vocabQuery);

  // Generate Questions from Firestore Data
  const quizQuestions = useMemo(() => {
    if (vocabList.length < 5) return [];
    
    // Create 10 random questions
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10).map((v, index) => {
      const type = index % 2 === 0 ? "mcq" : "fill";
      if (type === "mcq") {
        // Find 3 wrong options
        const others = vocabList.filter(o => o.id !== v.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [v.ngaju, ...others.map(o => o.ngaju)].sort(() => 0.5 - Math.random());
        return {
          id: v.id,
          type: "mcq",
          question: `Apa terjemahan Bahasa Dayak Ngaju dari "${v.indonesian}"?`,
          options,
          answer: v.ngaju
        };
      } else {
        return {
          id: v.id,
          type: "fill",
          question: `Lengkapilah: Bahasa Indonesia dari "${v.ngaju}" adalah...`,
          answer: v.indonesian
        };
      }
    });
  }, [vocabList]);

  const question = quizQuestions[currentStep];
  const progress = quizQuestions.length > 0 ? ((currentStep) / quizQuestions.length) * 100 : 0;

  const handleOptionSelect = (option: string) => {
    if (isCorrect !== null) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    let correct = false;
    if (question.type === "mcq") {
      correct = selectedOption === question.answer;
    } else {
      correct = fillValue.toLowerCase().trim() === question.answer.toLowerCase().trim();
    }

    setIsCorrect(correct);
    if (correct) setScore(score + 1);
  };

  const nextQuestion = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setFillValue("");
      setIsCorrect(null);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOption(null);
    setFillValue("");
    setIsCorrect(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Menyiapkan tantangan...</p>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
         <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Kosakata tidak cukup</h1>
            <p className="text-muted-foreground mb-6">Minimal diperlukan 5 kosakata di database untuk memulai tantangan.</p>
            <Button asChild><a href="/admin">Tambah Kosakata ke Database</a></Button>
         </Card>
      </div>
    );
  }

  if (isFinished) {
    const percentage = (score / quizQuestions.length) * 100;
    let message = "Jangan menyerah, ayo belajar lagi!";
    if (percentage >= 80) message = "Luar biasa! Kamu hebat sekali!";
    else if (percentage >= 50) message = "Bagus! Terus berlatih ya.";

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="bg-card p-12 rounded-3xl shadow-2xl border border-border space-y-8">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-primary">Tantangan Selesai!</h1>
            <p className="text-xl text-muted-foreground font-medium">{message}</p>
          </div>
          
          <div className="text-6xl font-bold text-primary">
            {score} <span className="text-2xl text-muted-foreground">/ {quizQuestions.length}</span>
          </div>

          <div className="space-y-4 pt-4">
            <Button className="w-full h-12 text-lg rounded-full shadow-md" onClick={resetQuiz}>
              <RefreshCcw className="mr-2 w-5 h-5" /> Ulangi Latihan
            </Button>
            <Button variant="outline" className="w-full h-12 text-lg rounded-full border-primary text-primary hover:bg-primary/5 shadow-sm" asChild>
              <a href="/">Kembali ke Beranda</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8 space-y-4 text-center">
        <div className="flex justify-between items-center text-sm font-bold text-primary uppercase tracking-widest">
          <span>Pertanyaan {currentStep + 1} dari {quizQuestions.length}</span>
          <span>Skor: {score}</span>
        </div>
        <Progress value={progress} className="h-2 shadow-inner" />
      </div>

      <Card className="shadow-2xl border-none overflow-hidden bg-card">
        <div className="h-2 bg-primary" />
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-headline leading-relaxed text-center text-primary">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {question.type === "mcq" ? (
            <div className="grid grid-cols-1 gap-4">
              {question.options?.map((option, idx) => (
                <button
                  key={idx}
                  disabled={isCorrect !== null}
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all font-bold flex justify-between items-center shadow-sm",
                    selectedOption === option ? "border-primary bg-primary/5 text-primary" : "border-muted hover:border-primary/50 bg-white",
                    isCorrect !== null && option === question.answer && "border-primary bg-primary/10 text-primary shadow-md",
                    isCorrect === false && selectedOption === option && option !== question.answer && "border-destructive bg-destructive/5 text-destructive"
                  )}
                >
                  {option}
                  {isCorrect !== null && option === question.answer && <CheckCircle2 className="w-5 h-5" />}
                  {isCorrect === false && selectedOption === option && option !== question.answer && <XCircle className="w-5 h-5" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Input 
                placeholder="Ketik jawabanmu di sini..."
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                disabled={isCorrect !== null}
                className={cn(
                  "h-14 text-lg text-center font-bold shadow-inner bg-white",
                  isCorrect === true && "border-primary bg-primary/10 text-primary",
                  isCorrect === false && "border-destructive bg-destructive/5 text-destructive"
                )}
              />
              {isCorrect === false && (
                <p className="text-sm text-center text-primary font-bold">
                  Jawaban yang benar: <span className="underline decoration-2">{question.answer}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-8 pb-8">
          {isCorrect === null ? (
            <Button 
              className="w-full h-12 text-lg rounded-full shadow-lg" 
              onClick={checkAnswer}
              disabled={question.type === "mcq" ? !selectedOption : !fillValue.trim()}
            >
              Periksa Jawaban
            </Button>
          ) : (
            <Button 
              className="w-full h-12 text-lg rounded-full gap-2 shadow-lg" 
              onClick={nextQuestion}
            >
              Lanjut <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
