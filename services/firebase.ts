// @ts-ignore
import { initializeApp } from "firebase/app";
// @ts-ignore
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApP0pgJcqQs8N9sWWAHWVrFtHEHKFmf0w",
  authDomain: "grameen-energy-ac9ac.firebaseapp.com",
  databaseURL: "https://grameen-energy-ac9ac-default-rtdb.firebaseio.com",
  projectId: "grameen-energy-ac9ac",
  storageBucket: "grameen-energy-ac9ac.firebasestorage.app",
  messagingSenderId: "235538916133",
  appId: "1:235538916133:web:1e6609142353ef1e1fb0cc"
};

let db: any;

try {
  // @ts-ignore
  const app = initializeApp(firebaseConfig);
  // @ts-ignore
  db = getFirestore(app);
  console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export { db };
export default db;