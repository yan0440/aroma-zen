import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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

      if (loginError?.code === 'auth/invalid-credential') {
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
    <div className="flex min-h-screen items-center justify-center bg-[#F5F3EE] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-[#E5E0D8] bg-white p-8 shadow-xl"
      >
        <h1 className="text-2xl font-black text-[#3A4F3F]">
          開發者登入
        </h1>

        <p className="mt-2 text-sm text-[#8A938B]">
          請登入後進入開發者專區
        </p>

        <label className="mt-6 block text-sm font-bold text-[#53645A]">
          帳號
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#6B9080]"
          autoComplete="email"
          required
        />

        <label className="mt-4 block text-sm font-bold text-[#53645A]">
          密碼
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E5E0D8] px-4 py-3 outline-none focus:border-[#6B9080]"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="mt-4 rounded-xl bg-[#FFF0ED] px-4 py-3 text-sm text-[#B47B6B]">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-3 font-bold text-[#A39284] hover:text-[#3A4F3F]"
          >
            返回首頁
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-[#3A5546] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? '登入中...' : '登入'}
          </button>
        </div>
      </form>
    </div>
  );
}