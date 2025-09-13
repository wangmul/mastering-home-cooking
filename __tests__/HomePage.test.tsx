import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../src/app/page';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));
jest.mock('@/lib/supabase-browser');

const mockCreateSupabaseBrowserClient = createSupabaseBrowserClient as jest.Mock;
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('HomePage', () => {
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
    mockCreateSupabaseBrowserClient.mockClear();
  });

  it('renders loading state initially', async () => {
    mockCreateSupabaseBrowserClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
    });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => new Promise(() => {}) }); // Never resolves
    render(<HomePage />);
    // The loading spinner should appear while fetching data
    const spinner = await screen.findByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders the plan summary when logged in', async () => {
    mockCreateSupabaseBrowserClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
    });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockSummary) });
    render(<HomePage />);

    await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
    });
    
    expect(screen.getByText('된장찌개')).toBeInTheDocument();
    expect(screen.getByText('나의 레시피')).toBeInTheDocument();
    expect(screen.getByText('My test recipe')).toBeInTheDocument();
  });

  it('renders the login form when not logged in', async () => {
    mockCreateSupabaseBrowserClient.mockReturnValue({
        auth: {
            getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
        },
    });

    render(<HomePage />);

    await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});