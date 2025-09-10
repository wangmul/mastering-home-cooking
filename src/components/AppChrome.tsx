"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';

  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" href="/">
              Mastering Home Cooking
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className={`nav-link ${pathname === '/' ? 'active' : ''}`} href="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${pathname.startsWith('/plan') ? 'active' : ''}`} href="/plan">
                    52주 로드맵
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${pathname === '/admin' ? 'active' : ''}`} href="/admin">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mt-4">{children}</main>
    </>
  );
}

