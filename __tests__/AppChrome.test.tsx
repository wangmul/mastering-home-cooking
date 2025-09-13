import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AppChrome from '@/components/AppChrome';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { User } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@/lib/supabase-browser');

const mockSupabase = createSupabaseBrowserClient as jest.Mock;

describe('AppChrome', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSupabase.mockClear();
  });

  it('renders the navbar brand and children', () => {
    mockSupabase.mockReturnValue({
      auth: {
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    });

    render(<AppChrome><div>Test Child</div></AppChrome>);

    expect(screen.getByText('Mastering Home Cooking')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('52주 로드맵')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('shows nothing in the nav for a logged-out user', () => {
    mockSupabase.mockReturnValue({
      auth: {
        onAuthStateChange: jest.fn().mockImplementation((callback) => {
          callback('SIGNED_OUT', null);
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    });

    render(<AppChrome><div>Test Child</div></AppChrome>);

    // Check that user email is not present
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it('shows user email and logout for a logged-in user', async () => {
    const mockUser = { email: 'test@example.com' };
    mockSupabase.mockReturnValue({
      auth: {
        onAuthStateChange: jest.fn().mockImplementation((callback) => {
          callback('SIGNED_IN', { user: mockUser });
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }),
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: mockUser } } }),
        signOut: jest.fn(),
      },
    });

    render(<AppChrome><div>Test Child</div></AppChrome>);

    await waitFor(() => {
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    // This part is tricky to test without user interaction, but we can check for the dropdown toggle
    expect(screen.getByText(mockUser.email)).toHaveClass('dropdown-toggle');
  });
});