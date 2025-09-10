"use client";
import React, { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AdminPage() {
  const supabase = createSupabaseBrowserClient();
  const [status, setStatus] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setToken(s?.access_token ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    setStatus("Saving...");
    const res = await fetch('/api/admin/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${json.error || res.statusText}`);
    } else {
      setStatus('Saved!');
      form.reset();
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return setStatus('Sign in first');
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    setStatus('Uploading...');
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) setStatus(`Upload error: ${json.error || res.statusText}`);
    else setStatus(`Uploaded: ${json.url}`);
  }

  return (
    <section>
      <h1>Admin</h1>
      <p>Create or update a page. Requires sign-in with an allowed admin email.</p>
      {!token && (
        <p>
          You are not signed in. <Link href="/login">Go to login</Link>
        </p>
      )}
      {token && (
        <p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setStatus('Signed out');
            }}
          >
            Sign out
          </button>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" type="text" required placeholder="My Page" />
        </label>
        <label>
          Slug
          <input name="slug" type="text" required placeholder="my-page" />
        </label>
        <label>
          Body (Markdown)
          <textarea name="body" rows={12} placeholder={"# Heading\nContent..."} />
        </label>
        <button type="submit">Save</button>
      </form>
      <h2>Upload Image</h2>
      <form onSubmit={handleUpload}>
        <label>
          Prefix (folder)
          <input name="prefix" type="text" placeholder="my-page" />
        </label>
        <label>
          File
          <input name="file" type="file" accept="image/*" required />
        </label>
        <button type="submit">Upload</button>
      </form>
      {status && <p>{status}</p>}
    </section>
  );
}
