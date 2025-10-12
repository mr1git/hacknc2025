"use client";

import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <header className="bg-dark-purple text-white">
      <div className="flex items-center justify-between px-6 py-3 border-b border-green-600">
        {/* Brand + Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold italic">
            Fidelity QuickBest AI
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span>|</span>
            <Link href="/aboutus" className="hover:underline">
              About Us
            </Link>
            <span>|</span>
            <Link href="/signup" className="hover:underline">
              Sign up
            </Link>
            <span>|</span>
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
