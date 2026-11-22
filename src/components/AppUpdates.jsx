import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  APP_VERSION,
  APP_RELEASE,
} from '../generatedVersion';

import './AppUpdates.css';

const UpdateContext = createContext(null);

const VERSION_PATTERN =
  /^v\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/;

function normalizeRelease(data) {
  if (
    !data ||
    typeof data !== 'object' ||
    !VERSION_PATTERN.test(String(data.version || ''))
  ) {
    throw new Error('版本資訊格式不正確。');
  }

  return {
    version: data.version,
    title:
      typeof data.title === 'string'
        ? data.title
        : '版本更新',

    changes: Array.isArray(data.changes)
      ? data.changes.filter(
          (item) =>
            typeof item === 'string' &&
            item.trim()
        )
      : [],
  };
}

function useAppUpdates() {
  const context = useContext(UpdateContext);

  if (!context) {
    throw new Error(
      '版本設定需要放在 AppUpdateProvider 裡。'
    );
  }

  return context;
}

function ReleaseNotes({ release }) {
  if (!release) return null;

  return (
    <div className="app-update-notes">
      <p className="app-update-release-title">
        {release.title || '版本更新'}
      </p>

      {release.changes?.length > 0 ? (
        <ul>
          {release.changes.map((change, index) => (
            <li key={`${index}-${change}`}>
              {change}
            </li>
          ))}
        </ul>
      ) : (
        <p className="app-update-muted">
          此版本未提供更新說明。
        </p>
      )}
    </div>
  );
}

export function AppUpdateProvider({ children }) {
  const [remoteRelease, setRemoteRelease] =
    useState(null);

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const [dismissedVersion, setDismissedVersion] =
    useState('');

  const hasUpdate = Boolean(
    remoteRelease &&
      remoteRelease.version > APP_VERSION
  );

  const checkForUpdates = useCallback(
    async (signal) => {
      setStatus('checking');
      setError('');

      const controller = new AbortController();

      const abort = () => {
        controller.abort();
      };

      if (signal?.aborted) {
        return;
      }

      signal?.addEventListener('abort', abort, {
        once: true,
      });

      let timedOut = false;

      const timeout = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 12000);

      try {
        const url = new URL(
          `${import.meta.env.BASE_URL}version.json`,
          window.location.origin
        );

        url.searchParams.set(
          'check',
          String(Date.now())
        );

        const response = await fetch(url, {
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('無法取得版本資訊。');
        }

        const data = normalizeRelease(
          await response.json()
        );

        if (controller.signal.aborted) return;

        setRemoteRelease(data);

        const newer = data.version > APP_VERSION;

        setStatus(newer ? 'available' : 'latest');

        if (newer) {
          setDismissedVersion('');
        }
      } catch (checkError) {
        if (signal?.aborted) return;

        setStatus('error');

        setError(
          timedOut
            ? '檢查更新逾時，請稍後再試。'
            : '目前無法檢查更新，請確認網路後再試。'
        );
      } finally {
        window.clearTimeout(timeout);

        signal?.removeEventListener(
          'abort',
          abort
        );
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    checkForUpdates(controller.signal);

    return () => {
      controller.abort();
    };
  }, [checkForUpdates]);

  const applyUpdate = useCallback(() => {
    const confirmed = window.confirm(
      '更新將重新載入 App，尚未儲存的內容會遺失。請先確認資料已儲存，是否立即更新？'
    );

    if (!confirmed) return;

    window.location.reload();
  }, []);

  const dismissUpdate = useCallback(() => {
    if (remoteRelease) {
      setDismissedVersion(remoteRelease.version);
    }
  }, [remoteRelease]);

  const contextValue = useMemo(
    () => ({
      currentVersion: APP_VERSION,
      currentRelease: APP_RELEASE,
      remoteRelease,
      hasUpdate,
      status,
      error,
      checkForUpdates,
      applyUpdate,
    }),
    [
      remoteRelease,
      hasUpdate,
      status,
      error,
      checkForUpdates,
      applyUpdate,
    ]
  );

  const showNotice =
    hasUpdate &&
    remoteRelease.version !== dismissedVersion;

  return (
    <UpdateContext.Provider value={contextValue}>
      {children}

      {showNotice && (
        <aside
          className="app-update-scope app-update-notice"
          aria-labelledby="app-update-notice-title"
        >
          <h2
            id="app-update-notice-title"
            className="app-update-heading"
          >
            有新版本可用
          </h2>

          <p className="app-update-muted app-update-version">
            {remoteRelease.version}
          </p>

          <ReleaseNotes release={remoteRelease} />

          <p className="app-update-muted app-update-hint">
            請先儲存正在編輯的內容，再進行更新。
          </p>

          <div className="app-update-actions">
            <button
              type="button"
              className="app-update-button"
              onClick={dismissUpdate}
            >
              稍後
            </button>

            <button
              type="button"
              className="app-update-button app-update-primary"
              onClick={applyUpdate}
            >
              立即更新
            </button>
          </div>
        </aside>
      )}
    </UpdateContext.Provider>
  );
}

export function AppUpdateSettings() {
  const {
    currentVersion,
    currentRelease,
    remoteRelease,
    hasUpdate,
    status,
    error,
    checkForUpdates,
    applyUpdate,
  } = useAppUpdates();

  const [showNotes, setShowNotes] = useState(false);

  const releaseToShow =
    hasUpdate ? remoteRelease : currentRelease;

  let statusText = '';

  if (status === 'checking') {
    statusText = '正在檢查更新…';
  } else if (hasUpdate) {
    statusText =
      `有新版本可用：${remoteRelease.version}`;
  } else if (status === 'latest') {
    statusText = '目前已是最新版本。';
  } else if (status === 'error') {
    statusText = error;
  }

  return (
    <section
      className="app-update-scope app-update-settings"
      aria-labelledby="app-update-settings-title"
    >
      <h3
        id="app-update-settings-title"
        className="app-update-section-title"
      >
        版本與更新
      </h3>

      <p className="app-update-muted app-update-version">
        目前版本：{currentVersion}
      </p>

      <div className="app-update-actions">
        <button
          type="button"
          className="app-update-button"
          disabled={status === 'checking'}
          onClick={() => {
            checkForUpdates();
          }}
        >
          {status === 'checking'
            ? '檢查中…'
            : '檢查更新'}
        </button>

        <button
          type="button"
          className="app-update-button"
          aria-expanded={showNotes}
          onClick={() => {
            setShowNotes((previous) => !previous);
          }}
        >
          {showNotes
            ? '收合更新內容'
            : '查看更新內容'}
        </button>
      </div>

      {statusText && (
        <p
          role="status"
          className="app-update-muted app-update-hint"
        >
          {statusText}
        </p>
      )}

      {(showNotes || hasUpdate) && (
        <ReleaseNotes release={releaseToShow} />
      )}

      {hasUpdate && (
        <>
          <p className="app-update-muted app-update-hint">
            更新前請先儲存資料，更新會重新載入 App。
          </p>

          <button
            type="button"
            className="app-update-button app-update-primary app-update-install"
            onClick={applyUpdate}
          >
            立即更新
          </button>
        </>
      )}
    </section>
  );
}