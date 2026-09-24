import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';
import { SourceModal } from './components/common/SourceModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TroubleshootPage } from './pages/TroubleshootPage';
import { ChatPage } from './pages/ChatPage';
import { ScreenshotPage } from './pages/ScreenshotPage';
import { OCRPage } from './pages/OCRPage';
import { UploadManualPage } from './pages/UploadManualPage';
import { VoicePage } from './pages/VoicePage';
import { ReportsPage } from './pages/ReportsPage';
import { MachinesPage } from './pages/MachinesPage';
import { ManualsPage } from './pages/ManualsPage';
import { HistoryPage } from './pages/HistoryPage';
import { PlansPage } from './pages/PlansPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

const AppContent: React.FC = () => {
  const { currentRoute, viewingSource, setViewingSource } = useApp();

  const renderRoute = () => {
    switch (currentRoute) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'troubleshoot':
        return <TroubleshootPage />;
      case 'chat':
        return <ChatPage />;
      case 'screenshot':
        return <ScreenshotPage />;
      case 'ocr':
        return <OCRPage />;
      case 'upload-manual':
        return <UploadManualPage />;
      case 'voice':
        return <VoicePage />;
      case 'reports':
        return <ReportsPage />;
      case 'machines':
        return <MachinesPage />;
      case 'manuals':
        return <ManualsPage />;
      case 'history':
        return <HistoryPage />;
      case 'plans':
        return <PlansPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black font-sans selection:bg-black selection:text-[#FED000]">
      {/* Top Header */}
      <Header />

      {/* Main Page Viewport */}
      <main className="w-full">
        {renderRoute()}
      </main>

      {/* Source Citation Modal (Grounded verification view) */}
      <SourceModal
        source={viewingSource}
        onClose={() => setViewingSource(null)}
      />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
