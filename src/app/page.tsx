import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type PageRow = {
  id: string;
  slug: string;
  title: string;
  created_at: string;
};

export default async function HomePage() {
  const supabase = createSupabaseServerClient('anon');
  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="alert alert-danger">Failed to load pages: {error.message}</p>;
  }

  return (
    <section>
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Mastering Home Cooking</h1>
          <p className="col-md-8 fs-4">
            Welcome! This is a project to help you learn and master home cooking through a 52-week guided roadmap.
          </p>
        </div>
      </div>

      <h2>Pages</h2>
      {!data?.length ? (
        <p className="alert alert-info">No content yet. Add one from the Admin panel.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row) => (
                <tr key={row.id}>
                  <td><Link href={`/${row.slug}`}>{row.title}</Link></td>
                  <td><code>{row.slug}</code></td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

