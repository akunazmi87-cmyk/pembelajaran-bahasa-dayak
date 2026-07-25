
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
      // Check if username unique
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Username sudah digunakan oleh pengguna lain.');
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Profile
      await updateProfile(user, { displayName: name });

      // Initialize Profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        username,
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
        description: "Silakan login dengan akun baru Anda.",
      });
      
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan oleh akun lain.');
      } else {
        setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <div className="h-2 bg-green-500 rounded-t-lg" />
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-headline font-bold text-primary">Daftar Akun Murid</CardTitle>
          <CardDescription>Mulai petualangan belajarmu hari ini!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input 
                id="name"
                required 
                placeholder="Budi Santoso" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username"
                required 
                placeholder="budi_ngaju" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                required 
                type="email" 
                placeholder="budi@sekolah.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi (Min 8 Karakter)</Label>
              <Input 
                id="password"
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <Input 
                id="confirmPassword"
                required 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="h-12 border-2 focus-visible:ring-primary"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12 text-lg rounded-full bg-primary hover:bg-primary/90 font-bold shadow-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-5 w-5" />} Daftar Sekarang
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun? <Link href="/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
          </p>
          <Button variant="ghost" onClick={() => router.push("/login")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
