// This file should only be used in server-side environments
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { LeaderboardEntry, UserStats } from '../types';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount!),
  });
}

const adminDb = getFirestore();

const calculateScore = (stats: UserStats): number => {
  const weights = {
    easy: 1,
    medium: 3,
    hard: 5,
    expert: 10,
  };
  let score = 0;
  score += (stats.easy || 0) * weights.easy;
  score += (stats.medium || 0) * weights.medium;
  score += (stats.hard || 0) * weights.hard;
  score += (stats.expert || 0) * weights.expert;
  return score;
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const leaderboard: LeaderboardEntry[] = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.stats) {
        leaderboard.push({
          uid: doc.id,
          displayName: data.displayName || 'Anonymous',
          photoURL: data.photoURL || null,
          stats: data.stats,
          score: calculateScore(data.stats),
        });
      }
    });
    
    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);
    
    return leaderboard.slice(0, 100); // Return top 100
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    // In case of error (e.g. service account not set up), return empty array
    return [];
  }
}
