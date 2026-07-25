'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, KeyRound, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Email tidak ditemukan atau password salah.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Kata sandi salah. Silakan coba lagi.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else if (err.code === 'auth/api-key-not-valid' || err.code === 'auth/invalid-api-key') {
        setError('Konfigurasi server bermasalah. Pastikan API Key sudah benar.');
      } else {
        setError('Gagal masuk. Pastikan akun sudah terdaftar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Masukkan email Anda terlebih dahulu" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Email pemulihan terkirim!", description: "Silakan periksa kotak masuk email Anda." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal mengirim email pemulihan" });
    }
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <div className="h-2 bg-primary rounded-t-lg" />
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary">DN</span>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-primary">Masuk ke Akun</CardTitle>
          <CardDescription>Silakan masuk untuk melanjutkan belajar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                required 
                type="email" 
                placeholder="nama@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input 
                id="password"
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12 text-lg rounded-full bg-primary font-bold shadow-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2 h-5 w-5" />} Masuk
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button variant="link" className="text-primary h-auto p-0" onClick={handleForgotPassword}>
            <KeyRound className="w-4 h-4 mr-1" /> Lupa kata sandi?
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Belum punya akun? 
            <Link href="/register">
              <Button variant="outline" className="rounded-full gap-2 border-primary text-primary hover:bg-primary/5">
                <UserPlus className="w-4 h-4" /> Daftar Akun
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
