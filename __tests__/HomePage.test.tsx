import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Mock the Supabase client
jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

const mockSupabase = createSupabaseServerClient as jest.Mock;

describe('HomePage', () => {
  it('renders the pages table with data', async () => {
    const mockData = [
      { id: '1', slug: 'page-one', title: 'Page One', created_at: new Date().toISOString() },
      { id: '2', slug: 'page-two', title: 'Page Two', created_at: new Date().toISOString() },
    ];

    mockSupabase.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: mockData, error: null }),
        }),
      }),
    });

    // As HomePage is a Server Component, we need to await its rendering
    const resolvedComponent = await HomePage();
    render(resolvedComponent);

    expect(screen.getByText('Page One')).toBeInTheDocument();
    expect(screen.getByText('page-one')).toBeInTheDocument();
    expect(screen.getByText('Page Two')).toBeInTheDocument();
    expect(screen.getByText('page-two')).toBeInTheDocument();
  });

  it('renders a message when there is no data', async () => {
    mockSupabase.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    });

    const resolvedComponent = await HomePage();
    render(resolvedComponent);

    expect(screen.getByText(/No content yet/)).toBeInTheDocument();
  });

  it('renders an error message on failure', async () => {
    mockSupabase.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: null, error: { message: 'Test error' } }),
        }),
      }),
    });

    const resolvedComponent = await HomePage();
    render(resolvedComponent);

    expect(screen.getByText(/Failed to load pages: Test error/)).toBeInTheDocument();
  });
});
