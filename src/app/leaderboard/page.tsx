
'use client';

import { useMemo } from 'react';
import { Trophy, Flame, Star, Award, Medal, ArrowLeft } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getLevelName } from '@/lib/student-logic';

export default function LeaderboardPage() {
  const db = useFirestore();
  const router = useRouter();
  
  const leadersQuery = useMemo(() => query(
    collection(db, 'users'), 
    orderBy('xp', 'desc'), 
    limit(20)
  ), [db]);
  
  const { data: leaders, loading } = useCollection<any>(leadersQuery);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft />
        </Button>
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" /> Papan Peringkat
        </h1>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden bg-white">
        <div className="h-2 bg-yellow-500" />
        <CardContent className="p-0">
          <div className="divide-y">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Memuat data...</div>
            ) : leaders?.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-8 flex justify-center text-2xl font-bold text-muted-foreground">
                    {index === 0 ? <Medal className="w-8 h-8 text-yellow-500" /> : 
                     index === 1 ? <Medal className="w-8 h-8 text-slate-400" /> :
                     index === 2 ? <Medal className="w-8 h-8 text-amber-600" /> :
                     index + 1}
                  </div>
                  <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="bg-primary text-white font-bold">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">{user.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                        LV {user.level}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border-orange-100">
                        <Flame className="w-3 h-3 mr-1 inline" /> {user.currentStreak} Hari
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{user.xp.toLocaleString()}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Poin XP</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
