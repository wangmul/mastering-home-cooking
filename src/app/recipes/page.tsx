"use client";
import React, { useEffect, useState } from 'react';

type Recipe = { id: string; title: string; notes: string | null; photo_url: string | null; created_at: string; rating: string | null; week: number };

const ratingColors: { [key: string]: string } = {
  '대박': '#28a745',
  '먹을만': '#ffc107',
  '망했음': '#dc3545',
};

const ratingIcons: { [key: string]: string } = {
  '대박': 'bi-emoji-heart-eyes-fill',
  '먹을만': 'bi-emoji-smile-fill',
  '망했음': 'bi-emoji-dizzy-fill',
};

export default function AllRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/recipes/all')
      .then(res => res.json())
      .then(data => {
        if (data.recipes) {
          setRecipes(data.recipes);
          setFilteredRecipes(data.recipes);
          const uniqueWeeks = [...new Set(data.recipes.map((r: Recipe) => r.week))].sort((a, b) => a - b);
          setWeeks(uniqueWeeks);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleWeekChange = (week: number | 'all') => {
    setSelectedWeek(week);
    if (week === 'all') {
      setFilteredRecipes(recipes);
    } else {
      setFilteredRecipes(recipes.filter(r => r.week === week));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>모든 레시피</h1>
        <div className="col-md-3">
          <select className="form-select" value={selectedWeek} onChange={(e) => handleWeekChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">모든 주</option>
            {weeks.map(w => (
              <option key={w} value={w}>{w}주차</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredRecipes.length > 0 ? filteredRecipes.map((r) => (
          <div key={r.id} className="col">
            <div className="card h-100">
              {r.photo_url && <img src={r.photo_url} className="card-img-top" alt={r.title} style={{ height: '200px', objectFit: 'cover' }}/>}
              <div className="card-body">
                {r.rating && (
                  <span className="badge mb-2" style={{ backgroundColor: ratingColors[r.rating] || '#6c757d' }}>
                    <i className={`bi ${ratingIcons[r.rating] || ''} me-1`}></i>
                    {r.rating}
                  </span>
                )}
                <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>{r.title}</p>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center">
                <small className="text-muted">{new Date(r.created_at).toLocaleDateString()}</small>
                <span className="badge bg-secondary">{r.week}주차</span>
              </div>
            </div>
          </div>
        )) : (
          <p>레시피가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
