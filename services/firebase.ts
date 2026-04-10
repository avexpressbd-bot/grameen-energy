import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2quDuygLI5EZiDz_xwBClgswhaOyVh0c",
  authDomain: "grameen-energy-655bc.firebaseapp.com",
  projectId: "grameen-energy-655bc",
  storageBucket: "grameen-energy-655bc.firebasestorage.app",
  messagingSenderId: "909658816808",
  appId: "1:909658816808:web:51832543eb683c5150901d",
  measurementId: "G-05DK24QGST"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default db;
