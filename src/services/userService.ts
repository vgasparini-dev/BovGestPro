import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import type { AppUser } from '../types';

type FarmDocument = {
  usuarios: AppUser[];
  [key: string]: unknown;
};

export async function getUsers(db: Firestore, adminEmail: string): Promise<AppUser[]> {
  const ref = doc(db, 'bovigest_users', adminEmail);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() as FarmDocument;
  return Array.isArray(data.usuarios) ? data.usuarios : [];
}

export async function saveUser(
  db: Firestore,
  adminEmail: string,
  user: AppUser,
  isNew: boolean
): Promise<void> {
  const ref = doc(db, 'bovigest_users', adminEmail);
  const snap = await getDoc(ref);

  let docData: FarmDocument = { usuarios: [] };
  if (snap.exists()) {
    docData = snap.data() as FarmDocument;
    if (!Array.isArray(docData.usuarios)) docData.usuarios = [];
  }

  if (isNew) {
    docData.usuarios = [user, ...docData.usuarios];
    // Also create/update the user's own document so they can log in
    const userRef = doc(db, 'bovigest_users', user.email.toLowerCase().trim());
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const newUserDoc: FarmDocument = {
        ...docData,
        usuarios: [user],
        _ownerEmail: adminEmail,
        _role: user.role,
      };
      await setDoc(userRef, newUserDoc);
    }
  } else {
    docData.usuarios = docData.usuarios.map((u) => (u.id === user.id ? user : u));
  }

  await setDoc(ref, docData);
}

export async function deleteUser(
  db: Firestore,
  adminEmail: string,
  userId: number
): Promise<void> {
  const ref = doc(db, 'bovigest_users', adminEmail);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const docData = snap.data() as FarmDocument;
  if (!Array.isArray(docData.usuarios)) return;

  docData.usuarios = docData.usuarios.filter((u) => u.id !== userId);
  await setDoc(ref, docData);
}

export async function ensureAdminExists(
  db: Firestore,
  adminEmail: string
): Promise<AppUser[]> {
  const ref = doc(db, 'bovigest_users', adminEmail);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as FarmDocument;
    return Array.isArray(data.usuarios) ? data.usuarios : [];
  }

  const admin: AppUser = {
    id: Date.now(),
    nome: adminEmail.split('@')[0],
    email: adminEmail,
    senha: 'admin',
    role: 'Admin',
    status: 'Ativo',
    criadoEm: new Date().toLocaleDateString('pt-BR'),
  };
  const newDoc: FarmDocument = { usuarios: [admin] };
  await setDoc(ref, newDoc);
  return [admin];
}
