
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  Gamepad2, 
  Award, 
  LogOut, 
  User, 
  Sparkles, 
  Calendar as CalendarIcon,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth, useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { getLevelName } from '@/lib/student-logic';
import { signOut } from 'firebase/auth';

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();

  const userRef = useMemo(() => (user ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile, loading: profileLoading } = useDoc<any>(userRef);

  const historyQuery = useMemo(() => 
    user ? query(collection(db, 'study_history'), where('uid', '==', user.uid), orderBy('date', 'desc'), limit(5)) : null
  , [user, db]);
  const { data: history } = useCollection<any>(historyQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Flame className="w-12 h-12 text-green-500 animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  const progressPercent = Math.min(100, (profile.xp % 250) / 2.5);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 ring-4 ring-green-100 ring-offset-2">
            <AvatarImage src={profile.photoURL} />
            <AvatarFallback className="bg-green-600 text-white text-2xl font-bold">
              {profile.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Halo, {profile.name}!</h1>
            <p className="text-muted-foreground font-medium">@{profile.username} • Level {profile.level} {getLevelName(profile.level)}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 shadow-sm">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            <span className="text-xl font-bold text-orange-700">{profile.currentStreak} Hari</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="rounded-full border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Actions */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-none bg-green-600 text-white overflow-hidden group" onClick={() => router.push('/vocabulary')}>
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-white/20 rounded-3xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Mulai Belajar</h3>
                  <p className="opacity-90">Kuasai kosakata baru hari ini.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-all cursor-pointer border-none bg-blue-600 text-white overflow-hidden group" onClick={() => router.push('/word-game')}>
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-white/20 rounded-3xl group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Bermain Game</h3>
                  <p className="opacity-90">Asah kemampuan susun katamu.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Activity Feed */}
          <section className="space-y-4">
            <h2 className="text-2xl font-headline font-bold flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-green-600" /> Riwayat Belajar
            </h2>
            <div className="space-y-3">
              {history && history.length > 0 ? history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-50 rounded-xl">
                      {h.activity === 'vocabulary' ? <BookOpen className="w-5 h-5 text-green-600" /> : <Gamepad2 className="w-5 h-5 text-green-600" />}
                    </div>
                    <div>
                      <p className="font-bold capitalize">{h.activity}</p>
                      <p className="text-xs text-muted-foreground">{new Date(h.date).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{h.xpEarned} XP</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-3xl italic">
                  Belum ada riwayat belajar. Ayo mulai sekarang!
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Stats Card */}
          <Card className="shadow-2xl border-none bg-white overflow-hidden">
            <div className="h-2 bg-green-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" /> Statistik Kamu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Progres XP</span>
                  <span>{profile.xp} XP</span>
                </div>
                <Progress value={progressPercent} className="h-3 bg-green-100" />
                <p className="text-xs text-center text-muted-foreground font-medium">Level Berikutnya: {250 - (profile.xp % 250)} XP lagi</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-primary">{profile.totalVocabulary || 0}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Kata</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-primary">{profile.totalGames || 0}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Game</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" /> Lencana Kamu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.badges && profile.badges.length > 0 ? profile.badges.map((b: string, i: number) => (
                  <Badge key={i} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 py-1.5 px-3 rounded-full text-xs font-bold gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" /> {b}
                  </Badge>
                )) : (
                  <p className="text-sm text-muted-foreground italic">Selesaikan tantangan untuk lencana pertama.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full h-14 rounded-3xl text-lg font-bold shadow-lg bg-green-600 hover:bg-green-700" onClick={() => router.push('/leaderboard')}>
             Lihat Papan Peringkat <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
