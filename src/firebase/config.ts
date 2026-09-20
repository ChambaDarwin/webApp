// src/firebase/config.ts
// Reemplaza estos valores con los de tu proyecto en la consola de Firebase.
// Recomendado: mover estos valores a variables de entorno (.env) con prefijo VITE_

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeM21IaxmkXHpdlyUGK5yaX_SxApL6Y58",
  authDomain: "escalon1.firebaseapp.com",
  projectId: "escalon1",
  storageBucket: "escalon1.firebasestorage.app",
  messagingSenderId: "548248061781",
  appId: "1:548248061781:web:333d616c99a9a98f0111dc",
  measurementId: "G-NEEE073Q0J",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export const iniciarSesionConGoogle = () => signInWithPopup(auth, googleProvider);
export const cerrarSesion = () => signOut(auth);
