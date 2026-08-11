import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAxQP3xmPqAMsJ39Q11XPsJivC6Maazf38',
  authDomain: 'herbal-encyclopedia-74726.firebaseapp.com',
  databaseURL: 'https://herbal-encyclopedia-74726-default-rtdb.firebaseio.com',
  projectId: 'herbal-encyclopedia-74726',
  storageBucket: 'herbal-encyclopedia-74726.firebasestorage.app',
  messagingSenderId: '589446540551',
  appId: '1:589446540551:web:0fb88475d02ffe5a1269a2',
  measurementId: 'G-FZEECL8R1F',
};

const app = initializeApp(firebaseConfig);

// 啟用 Firestore 離線持久化快取
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Analytics 在部分瀏覽器、隱私模式或非瀏覽器環境可能不支援
isSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  })
  .catch((error) => {
    console.warn('Firebase Analytics 無法啟用:', error);
  });