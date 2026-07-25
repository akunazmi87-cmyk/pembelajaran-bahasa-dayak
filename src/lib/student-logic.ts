
'use client';

import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

export type ActivityType = 'vocabulary' | 'game' | 'exercise' | 'audio';

const XP_MAP: Record<ActivityType, number> = {
  vocabulary: 10,
  game: 20,
  exercise: 30,
  audio: 5
};

export function getLevelName(level: number) {
  if (level >= 5) return "Master Dayak";
  if (level === 4) return "Ahli";
  if (level === 3) return "Penutur";
  if (level === 2) return "Pelajar";
  return "Pemula";
}

export function calculateLevel(xp: number) {
  // Simple level formula: Level 1 (0-99), Level 2 (100-249), Level 3 (250-499), etc.
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
}

export async function recordActivity(
  db: Firestore,
  userId: string,
  activity: ActivityType,
  details: { score?: number; vocabCount?: number } = {}
) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const today = new Date().toISOString().split('T')[0];
  const lastStudy = userData.lastStudyDate ? userData.lastStudyDate.split('T')[0] : null;

  let streakUpdate = {};
  if (lastStudy !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastStudy === yesterdayStr) {
      // Incremental streak
      streakUpdate = {
        currentStreak: increment(1),
        totalStudyDays: increment(1),
        lastStudyDate: today
      };
    } else {
      // Reset or new streak
      streakUpdate = {
        currentStreak: 1,
        totalStudyDays: increment(1),
        lastStudyDate: today
      };
    }
  }

  const xpEarned = XP_MAP[activity];
  const newXp = (userData.xp || 0) + xpEarned;
  const newLevel = calculateLevel(newXp);

  // Update User Profile
  updateDoc(userRef, {
    ...streakUpdate,
    xp: increment(xpEarned),
    level: newLevel,
    totalGames: activity === 'game' ? increment(1) : increment(0),
    totalVocabulary: activity === 'vocabulary' ? increment(details.vocabCount || 0) : increment(0),
    totalExercises: activity === 'exercise' ? increment(1) : increment(0),
  });

  // Check and add badges
  const currentBadges = userData.badges || [];
  const updatedBadges = [...currentBadges];
  const currentStreak = (userData.currentStreak || 0) + (lastStudy !== today ? 1 : 0);

  if (currentStreak >= 3 && !updatedBadges.includes('Pemula Rajin')) updatedBadges.push('Pemula Rajin');
  if (currentStreak >= 7 && !updatedBadges.includes('Semangat Belajar')) updatedBadges.push('Semangat Belajar');
  if (currentStreak >= 14 && !updatedBadges.includes('Ahli Kosakata')) updatedBadges.push('Ahli Kosakata');
  
  if (updatedBadges.length > currentBadges.length) {
    updateDoc(userRef, { badges: updatedBadges });
  }

  // Record in History
  addDoc(collection(db, 'study_history'), {
    uid: userId,
    date: new Date().toISOString(),
    activity: activity,
    xpEarned: xpEarned,
    score: details.score || 0,
    vocabularyLearned: details.vocabCount || 0
  });
}
