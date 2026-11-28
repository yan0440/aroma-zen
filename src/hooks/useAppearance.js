import {
  useCallback,
  useEffect,
  useState,
} from 'react';

const APPEARANCE_KEY = 'herbal-encyclopedia-appearance';

const DEFAULT_APPEARANCE = {
  theme: 'system',
  view: 'grid',
};

function readAppearance() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_APPEARANCE };
  }

  try {
    const saved = JSON.parse(
      window.localStorage.getItem(APPEARANCE_KEY) || '{}'
    );

    return {
      theme: ['light', 'dark', 'system'].includes(saved?.theme)
        ? saved.theme
        : DEFAULT_APPEARANCE.theme,

      view: ['grid', 'list'].includes(saved?.view)
        ? saved.view
        : DEFAULT_APPEARANCE.view,
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export default function useAppearance() {
  const [appearance, setAppearance] = useState(readAppearance);

  const [systemDark, setSystemDark] = useState(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return false;
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    const handleChange = (event) => {
      setSystemDark(event.matches);
    };

    setSystemDark(media.matches);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);

      return () => {
        media.removeEventListener('change', handleChange);
      };
    }

    media.addListener(handleChange);

    return () => {
      media.removeListener(handleChange);
    };
  }, []);

  const resolvedTheme =
    appearance.theme === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : appearance.theme;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        APPEARANCE_KEY,
        JSON.stringify(appearance)
      );
    } catch {
      // 無法儲存時，仍保留本次使用期間的設定。
    }
  }, [appearance]);

  useEffect(() => {
    document.documentElement.dataset.appTheme = resolvedTheme;
  }, [resolvedTheme]);

  const updateAppearance = useCallback((key, value) => {
    const allowedValues = {
      theme: ['light', 'dark', 'system'],
      view: ['grid', 'list'],
    };

    if (!allowedValues[key]?.includes(value)) {
      return;
    }

    setAppearance((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  return {
    appearance,
    resolvedTheme,
    updateAppearance,
  };
}