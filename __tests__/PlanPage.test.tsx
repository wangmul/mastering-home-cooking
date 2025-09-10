import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlanPage from '@/app/plan/page';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

// Mock dependencies
jest.mock('@/lib/supabase-browser', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  }),
}));

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('PlanPage', () => {
  const mockSummary = {
    week: { week: 1, stage: '기초', dish: '김치찌개', skill: '끓이기', difficulty: 1, time: '30분', color: '#3498db' },
    nextWeek: { week: 2, stage: '기초', dish: '된장찌개', skill: '볶기', difficulty: 1, time: '30분', color: '#3498db' },
    recipes: [
      { id: 'recipe-1', title: 'My test recipe', created_at: new Date().toISOString(), rating: '대박' },
    ],
    completed: false,
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders recipe with rating badge', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockSummary) });
    render(<PlanPage />);

    // Wait for the component to finish loading and rendering
    await waitFor(() => screen.getByText('My test recipe'));

    expect(screen.getByText('대박', { selector: 'span.badge' })).toBeInTheDocument();
    const badge = screen.getByText('대박', { selector: 'span.badge' });
    expect(badge).toHaveStyle('background-color: #28a745'); // Check for '대박' color
  });

  it('shows rating options in the add form', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockSummary) });
    render(<PlanPage />);

    await waitFor(() => screen.getByText('새 레시피 추가'));

    expect(screen.getByLabelText('대박')).toBeInTheDocument();
    expect(screen.getByLabelText('먹을만')).toBeInTheDocument();
    expect(screen.getByLabelText('망했음')).toBeInTheDocument();
  });

  it('shows rating options in the edit modal', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockSummary) });
    render(<PlanPage />);

    await waitFor(() => screen.getByText('My test recipe'));

    // Click the edit button
    fireEvent.click(screen.getByText('수정'));

    // Check if modal with rating is visible
    await waitFor(() => screen.getByText('레시피 수정'));

    const greatRadio = screen.getByRole('radio', { name: '대박', selector: '[name="editRating"]', checked: true }) as HTMLInputElement;
    expect(greatRadio.checked).toBe(true);
  });
});
