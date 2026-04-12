import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

const dbId = (firebaseConfig as any).firestoreDatabaseId || "(default)";
console.log("Initializing Firestore with Project:", firebaseConfig.projectId, "Database ID:", dbId);

// Use the specific firestoreDatabaseId from the config if it exists
export const db = getFirestore(app, dbId);
export const auth = getAuth(app);

export default db;
