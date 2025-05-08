// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcJt9jPyyL0RMZX0a-NnWGYSi66IEYNFY",
  authDomain: "fujiitchybun.firebaseapp.com",
  projectId: "fujiitchybun",
  storageBucket: "fujiitchybun.firebasestorage.app",
  messagingSenderId: "430795025409",
  appId: "1:430795025409:web:1486b3631dc84a61d56400",
  measurementId: "G-D3DLDSL2DR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(); // only once
export const db = getFirestore(app);
export {serverTimestamp};