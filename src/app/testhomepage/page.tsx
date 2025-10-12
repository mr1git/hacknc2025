import React from 'react';

export default function FidelityHero() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-dark-purple text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-green-600">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold italic">Fidelity</div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#" className="hover:underline">CUSTOMER SERVICE</a>
              <span>|</span>
              <a href="#" className="hover:underline">PROFILE</a>
              <span>|</span>
              <a href="#" className="hover:underline">OPEN AN ACCOUNT</a>
              <span>|</span>
              <a href="#" className="hover:underline">QUICK BEST ASSISTANT</a>
              <span>|</span>
              <a href="#" className="hover:underline">LOG IN</a>
            </nav>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 min-w-[280px]">
            <svg 
  className="text-gray-500 w-5 h-5" 
  fill="none" 
  stroke="currentColor" 
  viewBox="0 0 24 24"
>
  <path 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth={2} 
    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
  />
</svg>
            <input 
              type="text" 
              placeholder="How can we help?" 
              className="flex-1 outline-none text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="px-6 py-4">
          <ul className="flex gap-8 text-sm font-medium">
            <li><a href="#" className="hover:underline">Accounts & Trade</a></li>
            <li><a href="#" className="hover:underline">Planning & Advice</a></li>
            <li><a href="#" className="hover:underline">News & Research</a></li>
            <li><a href="#" className="hover:underline">Products</a></li>
            <li><a href="#" className="hover:underline">Why Fidelity</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <div 
        className="flex-1 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(/homebackground.jpg)'
        }}
      >
        <div className="absolute inset-0"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-xl">
            <div className="bg-white rounded-2xl p-10 shadow-2xl">
              <h1 className="text-4xl md:text-5xl font-light  leading-tight mb-8">
                What does the government shutdown mean for investors?
              </h1>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-white hover:bg-green-700 text-black px-8 py-3 rounded-full font-medium transition-colors">
                  Learn more
                </button>
                <button className="bg-white hover:bg-gray text-black px-8 py-3 rounded-full font-medium border-2 border-gray-900 transition-colors">
                  Open an account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}