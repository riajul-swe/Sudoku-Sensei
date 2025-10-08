import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './config';
import type { SavedProgress, Puzzle, Difficulty, UserStats } from '../types';

export const saveProgress = async (
  uid: string,
  userGrid: string,
  puzzle: Puzzle
): Promise<void> => {
  const progress: SavedProgress = { userGrid, puzzle };
  await setDoc(doc(db, 'games', uid), progress);
};

export const loadProgress = async (uid: string): Promise<SavedProgress | null> => {
  const docRef = doc(db, 'games', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as SavedProgress;
  } else {
    return null;
  }
};

export const updateUserStats = async (uid: string, difficulty: Difficulty): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    const statField = `stats.${difficulty}`;
    
    try {
        await updateDoc(userRef, {
            [statField]: increment(1)
        });
    } catch(error) {
        // If the document or stats field doesn't exist, create it.
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const newStats: UserStats = userData.stats || {};
            newStats[difficulty] = (newStats[difficulty] || 0) + 1;
             await updateDoc(userRef, { stats: newStats });
        }
    }
};

// This function needs to be used in a Node.js environment (e.g., Firebase Functions or a server route)
// because client-side SDKs cannot access all user data for privacy reasons.
// For this project, we'll create an admin-only version to be used in a server component.
export const getLeaderboardData = async () => {
    // This is a placeholder for where you would read from a 'users' collection.
    // In a real app, this should be done securely via a backend.
    console.warn("Leaderboard data fetching should be implemented on a secure backend.");
    return [];
}
