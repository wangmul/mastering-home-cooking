"use client";
import React, { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function Login() {
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
        router.refresh();
      }
    } catch (err: any) {
      setStatus(err?.message || 'Unknown error');
    }
  }

  return (
    <div className="card">
        <div className="card-body">
            <h2 className="card-title">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-control" />
                </div>
                <div className="mb-3">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary">{mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
            </form>
            <p className="mt-3">
                {mode === 'signin' ? (
                <>
                    No account?{' '}
                    <button className="btn btn-link" onClick={() => setMode('signup')}>Sign up</button>
                </>
                ) : (
                <>
                    Have an account?{' '}
                    <button className="btn btn-link" onClick={() => setMode('signin')}>Sign in</button>
                </>
                )}
            </p>
            {status && <p className="alert alert-info">{status}</p>}
        </div>
    </div>
  );
}
