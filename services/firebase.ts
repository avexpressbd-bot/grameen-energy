import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// আপনার ফায়ারবেস কনসোল থেকে নিচের কি-গুলো পরিবর্তন করুন
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "grameen-energy.firebaseapp.com",
  projectId: "grameen-energy",
  storageBucket: "grameen-energy.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default db;