import React, { useState, useEffect } from 'react';
import { AppView, ThemeMode } from './types';
import { UnifiedNavbar } from './components/UnifiedNavbar';
import { GisCommandCenter } from './components/GisCommandCenter';
import { MunicipalAdminDesk } from './components/MunicipalAdminDesk';
import { CitizenReportPortal } from './components/CitizenReportPortal';
import { ComplaintTracker } from './components/ComplaintTracker';

export const App: React.FC = () => {
  // Theme state with localStorage
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('cypher_theme_mode');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cypher_theme_mode', themeMode);
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // safe fallback
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Route / View state with URL synchronization
  const getInitialView = (): AppView => {
    if (typeof window === 'undefined') return 'console';
    const path = window.location.pathname.toLowerCase();
    if (path.includes('report') || path.includes('intake')) return 'report';
    if (path.includes('track')) return 'track';
    if (path.includes('admin') || path.includes('desk')) return 'admin';
    return 'console';
  };

  const [activeView, setActiveView] = useState<AppView>(getInitialView);
  const [trackerTicketId, setTrackerTicketId] = useState<string>('');
  const [gisFocusId, setGisFocusId] = useState<string>('rep-master-7x');

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setActiveView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectView = (view: AppView) => {
    setActiveView(view);
    try {
      const newPath = view === 'console' ? '/console' : `/${view}`;
      window.history.pushState(null, '', newPath);
    } catch {
      // safe fallback
    }
  };

  const handleNavigateToTracker = (ticketId: string) => {
    setTrackerTicketId(ticketId);
    handleSelectView('track');
  };

  const handleOpenGisConsole = (incidentId: string) => {
    setGisFocusId(incidentId);
    handleSelectView('console');
  };

  return (
    <div
      id="cypher-unified-app-root"
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-cyan-500 selection:text-slate-950 ${
        themeMode === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Universal Top Navigation Header */}
      <UnifiedNavbar
        activeView={activeView}
        onSelectView={handleSelectView}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Unified Viewport */}
      <main className="flex-1 flex flex-col w-full">
        {activeView === 'console' && (
          <GisCommandCenter />
        )}

        {activeView === 'admin' && (
          <MunicipalAdminDesk
            themeMode={themeMode}
            onOpenGisConsole={handleOpenGisConsole}
          />
        )}

        {activeView === 'report' && (
          <CitizenReportPortal
            themeMode={themeMode}
            onNavigateToTracker={handleNavigateToTracker}
          />
        )}

        {activeView === 'track' && (
          <ComplaintTracker
            themeMode={themeMode}
            initialTicketId={trackerTicketId}
            onOpenGisConsole={handleOpenGisConsole}
          />
        )}
      </main>
    </div>
  );
};

export default App;
