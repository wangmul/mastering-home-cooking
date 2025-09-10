import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import ReactMarkdown from 'react-markdown';

type PageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  created_at: string;
};

export async function generateStaticParams() {
  // Opt into SSG if desired; otherwise Next will SSR.
  return [];
}

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient('anon');
  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, body, created_at')
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>Not found</p>;

  return (
    <article>
      <h1>{data.title}</h1>
      <ReactMarkdown>{data.body}</ReactMarkdown>
    </article>
  );
}

