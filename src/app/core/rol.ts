import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../firebase';

export type Rol = 'administrador' | 'docente' | 'estudiante';

// Lee el rol real del usuario desde Firestore (usuarios/{uid}), no desde localStorage
export async function obtenerRolActual(): Promise<Rol | null> {
  // Espera a que Firebase termine de saber si hay sesión iniciada
  await auth.authStateReady();

  const usuario = auth.currentUser;
  if (!usuario) {
    return null;
  }

  try {
    const snap = await getDoc(doc(db, 'usuarios', usuario.uid));
    const rol = snap.data()?.['rol'];
    return rol === 'administrador' || rol === 'docente' || rol === 'estudiante' ? rol : null;
  } catch {
    return null;
  }
}
