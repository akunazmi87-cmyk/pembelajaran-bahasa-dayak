
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Admin_2") {
      // Simple session simulation
      localStorage.setItem("admin_auth", "true");
      router.push("/admin");
    } else {
      setError("Password yang Anda masukkan salah.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <div className="h-2 bg-primary rounded-t-lg" />
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Masuk Admin</CardTitle>
          <CardDescription>
            Hanya Admin (Guru) yang dapat mengelola data kosakata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Masukkan Password Admin"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full h-12 text-lg rounded-full font-bold">
              <LogIn className="mr-2 h-5 w-5" /> Masuk
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-muted-foreground gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
