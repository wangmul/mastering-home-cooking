"use client";
import React, { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [status, setStatus] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Working...');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setStatus('Sign-up complete. Check your email to confirm.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/admin');
      }
    } catch (err: any) {
      setStatus(err?.message || 'Unknown error');
    }
  }

  return (
    <section>
      <h1>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">{mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
      </form>
      <p>
        {mode === 'signin' ? (
          <>
            No account?{' '}
            <button onClick={() => setMode('signup')}>Sign up</button>
          </>
        ) : (
          <>
            Have an account?{' '}
            <button onClick={() => setMode('signin')}>Sign in</button>
          </>
        )}
      </p>
      {status && <p>{status}</p>}
    </section>
  );
}

