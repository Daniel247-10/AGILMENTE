import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCxTzJALEOQfTwj7mxDF1QJJuQYHZtiIVA',
  authDomain: 'agilmente-123.firebaseapp.com',
  projectId: 'agilmente-123',
  storageBucket: 'agilmente-123.firebasestorage.app',
  messagingSenderId: '564872320995',
  appId: '1:564872320995:web:98efb20c86da9509ad72d6',
  measurementId: 'G-66K91Y93W4'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
