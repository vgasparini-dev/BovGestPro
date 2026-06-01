import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export const FIREBASE_CONFIG_KEY = 'bovigest_firebase_config';
export const ADMIN_EMAIL_KEY = 'bovigest_admin_email';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function initFirebase(config: FirebaseConfig): { db: Firestore; auth: Auth } {
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  return { db, auth };
}

export function getFirebaseInstances(): { db: Firestore | null; auth: Auth | null } {
  return { db, auth };
}

export function getSavedConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FirebaseConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: FirebaseConfig): void {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
  localStorage.removeItem(ADMIN_EMAIL_KEY);
}
