"use client";

import { useState } from "react";
import { Trophy, CheckCircle2, XCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { QUIZ_QUESTIONS } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ChallengePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const question = QUIZ_QUESTIONS[currentStep];
  const progress = ((currentStep) / QUIZ_QUESTIONS.length) * 100;

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
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
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

  if (isFinished) {
    const percentage = (score / QUIZ_QUESTIONS.length) * 100;
    let message = "Jangan menyerah, ayo belajar lagi!";
    if (percentage >= 80) message = "Luar biasa! Kamu hebat sekali!";
    else if (percentage >= 50) message = "Bagus! Terus berlatih ya.";

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="bg-card p-12 rounded-3xl shadow-xl border border-border space-y-8">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold">Tantangan Selesai!</h1>
            <p className="text-xl text-muted-foreground">{message}</p>
          </div>
          
          <div className="text-6xl font-bold text-primary">
            {score} <span className="text-2xl text-muted-foreground">/ {QUIZ_QUESTIONS.length}</span>
          </div>

          <div className="space-y-4 pt-4">
            <Button className="w-full h-12 text-lg rounded-full" onClick={resetQuiz}>
              <RefreshCcw className="mr-2 w-5 h-5" /> Ulangi Latihan
            </Button>
            <Button variant="outline" className="w-full h-12 text-lg rounded-full" asChild>
              <a href="/">Kembali ke Beranda</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
          <span>Pertanyaan {currentStep + 1} dari {QUIZ_QUESTIONS.length}</span>
          <span>Skor: {score}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-xl border-none overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="p-8">
          <CardTitle className="text-2xl font-headline leading-relaxed">
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
                    "p-4 rounded-xl border-2 text-left transition-all font-medium flex justify-between items-center",
                    selectedOption === option ? "border-primary bg-primary/5 text-primary" : "border-muted hover:border-primary/50",
                    isCorrect !== null && option === question.answer && "border-primary bg-primary/10 text-primary font-bold shadow-sm",
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
                  "h-14 text-lg text-center font-bold",
                  isCorrect === true && "border-primary bg-primary/10 text-primary",
                  isCorrect === false && "border-destructive bg-destructive/5 text-destructive"
                )}
              />
              {isCorrect === false && (
                <p className="text-sm text-center text-primary font-medium">
                  Jawaban yang benar: <span className="font-bold">{question.answer}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-8 pb-8">
          {isCorrect === null ? (
            <Button 
              className="w-full h-12 text-lg rounded-full" 
              onClick={checkAnswer}
              disabled={question.type === "mcq" ? !selectedOption : !fillValue.trim()}
            >
              Periksa Jawaban
            </Button>
          ) : (
            <Button 
              className="w-full h-12 text-lg rounded-full gap-2" 
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
