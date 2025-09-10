"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Recipe = { id: string; title: string; notes: string | null; photo_url: string | null; created_at: string; rating: string | null };
type Summary = {
  currentWeek: number;
  week: any;
  nextWeek: any;
  recipes: Recipe[];
  completed: boolean;
};

const ratings = ['대박', '먹을만', '망했음'];
const ratingColors: { [key: string]: string } = {
  '대박': '#28a745',
  '먹을만': '#ffc107',
  '망했음': '#dc3545',
};

export default function PlanPage() {
  const supabase = createSupabaseBrowserClient();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [toast, setToast] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit state
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editRating, setEditRating] = useState<string | null>(null);

  const fetchSummary = useCallback(() => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined as any;
    fetch('/api/plan/summary', { headers })
      .then((r) => r.json())
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [token]);

  // Load auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setToken(s?.access_token ?? null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Load summary for current + next week
  useEffect(() => {
    if (token) {
      fetchSummary();
    } else {
      setLoading(false);
    }
  }, [token, fetchSummary]);

  // Toast effect
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function toggle(week: number) {
    if (!token) { setToast('로그인이 필요합니다.'); return; }
    const newVal = !(summary?.completed);
    setSummary((s) => (s ? { ...s, completed: newVal } : s));
    const res = await fetch('/api/plan/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ week, completed: newVal }),
    });
    if (!res.ok) {
      setSummary((s) => (s ? { ...s, completed: !newVal } : s));
      const j = await res.json();
      setToast(j.error || '업데이트 실패');
      return;
    }
    if (newVal) setToast(`${week}주차 완료!`);
  }

  function handleEditClick(recipe: Recipe) {
    setEditingRecipe(recipe);
    setEditText(recipe.title);
    setEditDate(recipe.created_at.substring(0, 10));
    setEditRating(recipe.rating);
  }

  async function handleUpdateRecipe() {
    if (!editingRecipe || !token) return;

    const payload = {
      title: editText,
      created_at: new Date(editDate).toISOString(),
      rating: editRating,
    };

    const res = await fetch(`/api/plan/recipes/${editingRecipe.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setToast(j.error || '레시피 업데이트 실패');
      return;
    }

    setToast('레시피가 수정되었습니다!');
    setEditingRecipe(null);
    fetchSummary(); // Refetch to get the updated list
  }

  if (loading && !summary) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">레시피 수정</h5>
                <button type="button" className="btn-close" onClick={() => setEditingRecipe(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="editText" className="form-label">레시피 내용</label>
                  <textarea id="editText" className="form-control" rows={8} value={editText} onChange={(e) => setEditText(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="editDate" className="form-label">작성일</label>
                  <input type="date" id="editDate" className="form-control" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">평가</label>
                  <div>
                    {ratings.map(r => (
                      <div className="form-check form-check-inline" key={r}>
                        <input className="form-check-input" type="radio" name="editRating" id={`edit-rating-${r}`} value={r} checked={editRating === r} onChange={() => setEditRating(r)} />
                        <label className="form-check-label" htmlFor={`edit-rating-${r}`}>{r}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRecipe(null)}>취소</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateRecipe}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div className={`toast ${toast ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header">
            <strong className="me-auto">알림</strong>
            <button type="button" className="btn-close" onClick={() => setToast('')} aria-label="Close"></button>
          </div>
          <div className="toast-body">{toast}</div>
        </div>
      </div>

      <div className="row g-4">
        {/* This Week and Next Week */}
        <div className="col-lg-12">
          <h2>이번 주 요리</h2>
          <div className="row">
            {summary?.week && (
              <div className="col-md-7">
                <div className={`card h-100 ${summary.completed ? 'border-success' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge fs-6" style={{ backgroundColor: summary.week.color }}>
                        {summary.week.week}주차: {summary.week.stage}
                      </span>
                      <button className={`btn btn-sm ${summary.completed ? 'btn-outline-secondary' : 'btn-primary'}`} onClick={() => toggle(summary.week.week)}>
                        {summary.completed ? '완료 취소' : '완료'}
                      </button>
                    </div>
                    <h3 className="card-title">{summary.week.dish}</h3>
                    <p className="card-text">
                      <strong>기술:</strong> {summary.week.skill} | 
                      <strong> 난이도:</strong> {summary.week.difficulty} | 
                      <strong> 시간:</strong> {summary.week.time}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {summary?.nextWeek && (
              <div className="col-md-5">
                <div className="card h-100 bg-light">
                  <div className="card-body">
                    <span className="badge fs-6" style={{ backgroundColor: summary.nextWeek.color }}>
                      {summary.nextWeek.week}주차 (다음 주)
                    </span>
                    <h4 className="card-title mt-2">{summary.nextWeek.dish}</h4>
                    <p className="card-text small">
                      <strong>기술:</strong> {summary.nextWeek.skill} | 
                      <strong> 난이도:</strong> {summary.nextWeek.difficulty} | 
                      <strong> 시간:</strong> {summary.nextWeek.time}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Recipes Section */}
        <div className="col-lg-12">
          <hr className="my-4" />
          <h2>나의 레시피</h2>
          {!token ? (
            <div className="alert alert-info">
              레시피를 추가하고 관리하려면 <a href="/login" className="alert-link">로그인</a>하세요.
            </div>
          ) : (
            <>
              {/* Add Recipe Form */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">새 레시피 추가</h5>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const fd = new FormData(form);
                    const payload = {
                      title: (fd.get('recipe') as string) || '',
                      photo_url: (fd.get('photo_url') as string) || null,
                      rating: (fd.get('rating') as string) || null,
                    };
                    if (!payload.title) { setToast('레시피 내용을 입력해주세요'); return; }
                    setAdding(true);
                    const res = await fetch('/api/plan/recipes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                      body: JSON.stringify(payload),
                    });
                    setAdding(false);
                    if (!res.ok) {
                      const json = await res.json().catch(() => ({}));
                      setToast(json.error || '추가 실패');
                      return;
                    }
                    form.reset();
                    setToast('레시피가 추가되었습니다!');
                    fetchSummary(); // Refetch data
                  }}>
                    <div className="mb-3">
                      <label htmlFor="recipe" className="form-label">레시피</label>
                      <textarea id="recipe" name="recipe" className="form-control" rows={5} placeholder="나만의 레시피를 자유롭게 기록하세요."></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="photo_url" className="form-label">사진 URL</label>
                      <input type="url" id="photo_url" name="photo_url" className="form-control" placeholder="https://..." />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">평가</label>
                      <div>
                        {ratings.map(r => (
                          <div className="form-check form-check-inline" key={r}>
                            <input className="form-check-input" type="radio" name="rating" id={`rating-${r}`} value={r} />
                            <label className="form-check-label" htmlFor={`rating-${r}`}>{r}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={adding}>
                      {adding ? '추가 중...' : '레시피 추가'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Recipe List */}
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {summary?.recipes?.length ? summary.recipes.map((r) => (
                  <div key={r.id} className="col">
                    <div className="card h-100">
                      {r.photo_url && <img src={r.photo_url} className="card-img-top" alt={r.title} style={{ height: '200px', objectFit: 'cover' }}/>}
                      <div className="card-body">
                        {r.rating && <span className="badge mb-2" style={{ backgroundColor: ratingColors[r.rating] }}>{r.rating}</span>}
                        <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>{r.title}</p>
                      </div>
                      <div className="card-footer d-flex justify-content-between align-items-center">
                        <small className="text-muted">{r.created_at.substring(0, 10)}</small>
                        <div>
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEditClick(r)}>수정</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                            if (!confirm('정말로 삭제하시겠습니까?')) return;
                            const resp = await fetch(`/api/plan/recipes/${r.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                            if (!resp.ok) { const j = await resp.json(); setToast(j.error || '삭제 실패'); return; }
                            setToast('레시피가 삭제되었습니다.');
                            fetchSummary(); // Refetch data
                          }}>삭제</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <p>아직 추가된 레시피가 없습니다.</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}