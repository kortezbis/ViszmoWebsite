import React, { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewStudyDashboardSkeleton() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans">
      {/* Sidebar */}
      <aside 
        className={`relative bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!isSidebarCollapsed ? (
            <span className="text-xl font-bold font-heading text-brand-primary">Brand</span>
          ) : (
            <span className="text-xl font-bold font-heading text-brand-primary mx-auto">B</span>
          )}
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-secondary transition-colors"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Sidebar Toggle when Collapsed */}
        {isSidebarCollapsed && (
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 rounded-lg hover:bg-surface-hover text-foreground-secondary transition-colors"
              aria-label="Expand Sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {/* Sidebar Navigation Skeleton */}
        <nav className="flex-1 py-4 flex flex-col gap-3 px-3 mt-2">
          {/* Skeleton items simulating nav links */}
          <div className={`h-10 rounded-lg bg-surface-hover animate-pulse ${isSidebarCollapsed ? 'w-10 mx-auto' : 'w-full'}`}></div>
          <div className={`h-10 rounded-lg bg-surface-hover animate-pulse ${isSidebarCollapsed ? 'w-10 mx-auto' : 'w-full'}`}></div>
          <div className={`h-10 rounded-lg bg-surface-hover animate-pulse ${isSidebarCollapsed ? 'w-10 mx-auto' : 'w-full'}`}></div>
          <div className={`h-10 rounded-lg bg-surface-hover animate-pulse ${isSidebarCollapsed ? 'w-10 mx-auto' : 'w-full'}`}></div>
        </nav>

        {/* Sidebar Footer Skeleton */}
        <div className="p-4 border-t border-border">
          <div className={`h-12 rounded-lg bg-surface-hover animate-pulse ${isSidebarCollapsed ? 'w-10 mx-auto' : 'w-full'}`}></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Skeleton */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
           <div className="w-48 h-6 bg-surface-hover rounded animate-pulse"></div>
           <div className="w-8 h-8 rounded-full bg-surface-hover animate-pulse"></div>
        </header>

        {/* Main Content Body Skeleton */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Page Title Skeleton */}
            <div className="w-64 h-8 bg-surface-hover rounded-lg animate-pulse mb-8"></div>

            {/* Dashboard Cards Skeleton Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-40 rounded-2xl bg-surface border border-border shadow-sm animate-pulse"></div>
              <div className="h-40 rounded-2xl bg-surface border border-border shadow-sm animate-pulse"></div>
              <div className="h-40 rounded-2xl bg-surface border border-border shadow-sm animate-pulse"></div>
            </div>

            {/* Main Content Section Skeleton */}
            <div className="mt-8 space-y-4">
              <div className="h-24 rounded-xl bg-surface border border-border animate-pulse"></div>
              <div className="h-24 rounded-xl bg-surface border border-border animate-pulse"></div>
              <div className="h-24 rounded-xl bg-surface border border-border animate-pulse"></div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
