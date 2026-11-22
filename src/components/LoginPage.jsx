import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LOGIN_STYLES = `
  .developer-login {
    --login-bg: var(--app-bg, #fdfbf7);
    --login-surface: var(--app-surface, #fffdf8);
    --login-soft: var(--app-surface-soft, #f0f3eb);
    --login-input: var(--app-input, #ffffff);
    --login-text: var(--app-text, #283c32);
    --login-muted: var(--app-muted, #657565);
    --login-border: var(--app-border, #dce2d7);
    --login-accent: var(--app-accent, #405e4c);

    --login-primary-bg: #405e4c;
    --login-primary-text: #fffdf8;
    --login-error-bg: #fbefec;
    --login-error-text: #9c544b;
    --login-error-border: #e7c6bf;

    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    background:
      radial-gradient(
        ellipse at 85% 10%,
        rgb(107 144 128 / 10%),
        transparent 55%
      ),
      var(--login-bg);
    color: var(--login-text);
    color-scheme: light;
  }

  :root[data-app-theme='dark'] .developer-login {
    --login-primary-bg: #b4cfb4;
    --login-primary-text: #17291e;
    --login-error-bg: #402b2b;
    --login-error-text: #edb6ac;
    --login-error-border: #6b4541;

    color-scheme: dark;
  }

  .developer-login .login-panel {
    width: 100%;
    max-width: 448px;
    border: 1px solid var(--login-border);
    border-radius: 24px;
    padding: 32px;
    background: var(--login-surface);
    box-shadow: 0 20px 60px -35px rgb(20 33 28 / 35%);
  }

  .developer-login .login-eyebrow {
    color: var(--login-accent);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
  }

  .developer-login .login-description {
    color: var(--login-muted);
  }

  .developer-login .login-label {
    display: block;
    color: var(--login-text);
    font-size: 14px;
    font-weight: 600;
  }

  .developer-login .login-input {
    width: 100%;
    margin-top: 8px;
    border: 1px solid var(--login-border);
    border-radius: 12px;
    padding: 12px 16px;
    background: var(--login-input);
    color: var(--login-text);
    font-size: 16px;
    line-height: 24px;
    outline: none;
    transition:
      border-color 160ms ease,
      background-color 160ms ease;
  }

  .developer-login .login-input::placeholder {
    color: var(--login-muted);
    opacity: 0.8;
  }

  .developer-login .login-input:focus-visible {
    border-color: var(--login-accent);
    outline: 2px solid var(--login-accent);
    outline-offset: 2px;
  }

  .developer-login .login-input:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .developer-login .login-input:-webkit-autofill,
  .developer-login .login-input:-webkit-autofill:hover,
  .developer-login .login-input:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--login-text);
    -webkit-box-shadow:
      0 0 0 1000px var(--login-input) inset;
    caret-color: var(--login-text);
  }

  .developer-login .login-error {
    border: 1px solid var(--login-error-border);
    border-radius: 12px;
    padding: 12px 16px;
    background: var(--login-error-bg);
    color: var(--login-error-text);
    font-size: 14px;
    line-height: 24px;
  }

  .developer-login .login-button {
    display: inline-flex;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--login-border);
    border-radius: 12px;
    padding: 10px 20px;
    background: var(--login-surface);
    color: var(--login-text);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .developer-login .login-button:hover:not(:disabled) {
    border-color: var(--login-accent);
    background: var(--login-soft);
  }

  .developer-login .login-button:focus-visible {
    outline: 2px solid var(--login-accent);
    outline-offset: 3px;
  }

  .developer-login .login-button-primary,
  .developer-login .login-button-primary:hover:not(:disabled) {
    border-color: var(--login-primary-bg);
    background: var(--login-primary-bg);
    color: var(--login-primary-text);
  }

  .developer-login .login-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 480px) {
    .developer-login .login-panel {
      padding: 26px 22px;
    }

    .developer-login .login-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .developer-login .login-input,
    .developer-login .login-button {
      transition: none;
    }
  }
`;

export default function LoginPage({
  onLogin,
  onClose,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (typeof onLogin === 'function') {
        onLogin();
      }
    } catch (loginError) {
      console.error('登入失敗：', loginError);

      if (
        loginError?.code === 'auth/invalid-credential'
      ) {
        setError('帳號或密碼錯誤。');
      } else if (
        loginError?.code === 'auth/too-many-requests'
      ) {
        setError('嘗試次數過多，請稍後再試。');
      } else if (
        loginError?.code === 'auth/user-not-found'
      ) {
        setError('找不到此帳號。');
      } else {
        setError('登入失敗，請確認帳號與密碼。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="developer-login">
      <style>{LOGIN_STYLES}</style>

      <form
        onSubmit={handleSubmit}
        className="login-panel"
        aria-labelledby="developer-login-title"
        aria-describedby="developer-login-description"
        aria-busy={isLoading}
      >
        <div className="login-eyebrow">
          KNOWLEDGE STUDIO
        </div>

        <h1
          id="developer-login-title"
          className="mt-3 text-2xl font-semibold tracking-tight"
        >
          開發者登入
        </h1>

        <p
          id="developer-login-description"
          className="login-description mt-2 text-sm leading-6"
        >
          請登入後進入開發者專區
        </p>

        <div className="mt-7">
          <label
            htmlFor="developer-login-email"
            className="login-label"
          >
            帳號
          </label>

          <input
            id="developer-login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            className="login-input"
            placeholder="請輸入電子郵件"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            disabled={isLoading}
            required
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="developer-login-password"
            className="login-label"
          >
            密碼
          </label>

          <input
            id="developer-login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            className="login-input"
            placeholder="請輸入密碼"
            autoComplete="current-password"
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <p
            role="alert"
            className="login-error mt-5"
          >
            {error}
          </p>
        )}

        <div className="login-actions mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="login-button"
          >
            返回首頁
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="login-button login-button-primary"
          >
            {isLoading ? '登入中…' : '登入'}
          </button>
        </div>
      </form>
    </div>
  );
}