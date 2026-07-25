'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setError('Kata sandi harus minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is unique
      const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Username sudah digunakan.');
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // UID as Document ID
      await setDoc(doc(db, 'users', user.uid), {
        name,
        username: username.toLowerCase().trim(),
        email,
        createdAt: new Date().toISOString(),
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyDays: 0,
        totalVocabulary: 0,
        totalGames: 0,
        totalExercises: 0,
        badges: [],
        lastStudyDate: null
      });

      toast({
        title: "Pendaftaran berhasil!",
        description: "Silakan masuk dengan akun baru Anda.",
      });
      
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <div className="h-2 bg-primary rounded-t-lg" />
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-headline font-bold text-primary">Daftar Akun</CardTitle>
          <CardDescription>Mulai petualangan belajarmu hari ini!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="h-12 border-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username (Unik)</Label>
              <Input id="username" required value={username} onChange={e => setUsername(e.target.value)} className="h-12 border-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 border-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi (Min 8 Karakter)</Label>
              <Input id="password" required type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 border-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <Input id="confirmPassword" required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-12 border-2" />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12 text-lg rounded-full bg-primary font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-5 w-5" />} Daftar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun? <Link href="/login" className="text-primary font-bold hover:underline">Masuk</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
