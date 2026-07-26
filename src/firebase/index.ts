'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
} {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // Menggunakan initializeFirestore dengan settings untuk stabilitas koneksi di lingkungan cloud
  const firestore = getApps().length > 0 
    ? getFirestore(app) 
    : initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });

  const auth = getAuth(app);
  const storage = getStorage(app);

  return { app, firestore, auth, storage };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
