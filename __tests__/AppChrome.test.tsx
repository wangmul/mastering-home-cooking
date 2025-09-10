import React from 'react';
import { render, screen } from '@testing-library/react';
import AppChrome from '@/components/AppChrome';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from 'next/navigation';

const usePathnameMock = usePathname as jest.Mock;

describe('AppChrome', () => {
  it('renders the navbar and children', () => {
    usePathnameMock.mockReturnValue('/');
    render(<AppChrome><div>Test Child</div></AppChrome>);

    // Check for navbar brand
    expect(screen.getByText('Mastering Home Cooking')).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('52주 로드맵')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    // Check for the child component
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('sets the active class on the correct nav link', () => {
    usePathnameMock.mockReturnValue('/plan');
    render(<AppChrome><div>Test Child</div></AppChrome>);

    const planLink = screen.getByText('52주 로드맵');
    const homeLink = screen.getByText('Home');

    expect(planLink).toHaveClass('active');
    expect(homeLink).not.toHaveClass('active');
  });

  it('sets the active class for the home page', () => {
    usePathnameMock.mockReturnValue('/');
    render(<AppChrome><div>Test Child</div></AppChrome>);

    const planLink = screen.getByText('52주 로드맵');
    const homeLink = screen.getByText('Home');

    expect(planLink).not.toHaveClass('active');
    expect(homeLink).toHaveClass('active');
  });
});
