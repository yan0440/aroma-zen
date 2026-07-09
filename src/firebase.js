// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 1. 補上這行

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxQP3xmPqAMsJ39Q11XPsJivC6Maazf38",
  authDomain: "herbal-encyclopedia-74726.firebaseapp.com",
  databaseURL: "https://herbal-encyclopedia-74726-default-rtdb.firebaseio.com",
  projectId: "herbal-encyclopedia-74726",
  storageBucket: "herbal-encyclopedia-74726.firebasestorage.app",
  messagingSenderId: "589446540551",
  appId: "1:589446540551:web:0fb88475d02ffe5a1269a2",
  measurementId: "G-FZEECL8R1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. 初始化並匯出 db
export const db = getFirestore(app);