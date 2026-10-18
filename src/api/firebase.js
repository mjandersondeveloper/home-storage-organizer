import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase configuration: ${missingConfig.join(", ")}. ` +
      "Set the VITE_FIREBASE_* values in your environment."
  );
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const database = getDatabase(app);