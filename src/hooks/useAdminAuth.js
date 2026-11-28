import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signOut,
} from 'firebase/auth';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
];

const auth = getAuth();

const persistenceReady = setPersistence(
  auth,
  browserSessionPersistence
).catch((error) => {
  console.error('設定登入保存方式失敗：', error);
});

export default function useAdminAuth({
  onIdleLogout,
} = {}) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const onIdleLogoutRef = useRef(onIdleLogout);

  useEffect(() => {
    onIdleLogoutRef.current = onIdleLogout;
  }, [onIdleLogout]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    persistenceReady.then(() => {
      if (cancelled) return;

      unsubscribe = onAuthStateChanged(
        auth,
        (nextUser) => {
          setUser(nextUser);
          setAuthReady(true);
        }
      );
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const isAdminAuthenticated =
    Boolean(user) && !user.isAnonymous;

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('登出失敗：', error);
    }
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) return undefined;

    let lastActive = Date.now();
    let timerId = null;

    const autoLogout = async () => {
      window.clearTimeout(timerId);
      await logout();
      onIdleLogoutRef.current?.();
    };

    const schedule = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(
        autoLogout,
        IDLE_TIMEOUT_MS
      );
    };

    const markActive = () => {
      const now = Date.now();

      if (now - lastActive < 1000) return;

      lastActive = now;
      schedule();
    };

    const checkIdle = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastActive >= IDLE_TIMEOUT_MS
      ) {
        autoLogout();
      }
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActive, {
        passive: true,
      });
    });

    document.addEventListener(
      'visibilitychange',
      checkIdle
    );
    window.addEventListener('focus', checkIdle);

    schedule();

    return () => {
      window.clearTimeout(timerId);

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          markActive
        );
      });

      document.removeEventListener(
        'visibilitychange',
        checkIdle
      );
      window.removeEventListener('focus', checkIdle);
    };
  }, [isAdminAuthenticated, logout]);

  return {
    isAdminAuthenticated,
    authReady,
    logout,
  };
}