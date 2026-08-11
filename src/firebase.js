import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
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

// 初始化 Firebase App
const app = initializeApp(firebaseConfig);

// 匯出 app，供其他檔案使用
export { app };

// 初始化 Firebase Authentication
export const auth = getAuth(app);

// 初始化 Firestore 離線持久化快取
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Firebase Analytics
// 部分瀏覽器、無痕模式或非瀏覽器環境可能不支援 Analytics
isSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  })
  .catch((error) => {
    console.warn('Firebase Analytics 無法啟用:', error);
  });