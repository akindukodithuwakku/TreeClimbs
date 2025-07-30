import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAZAzffI5C3bgrIVduRZ25pOea8YI4-ts",
  authDomain: "treeclimber-b1f3c.firebaseapp.com",
  databaseURL:
    "https://treeclimber-b1f3c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "treeclimber-b1f3c",
  storageBucket: "treeclimber-b1f3c.appspot.com",
  messagingSenderId: "554804238885",
  appId: "1:554804238885:web:6ec3c4281f3696914c7dcc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
