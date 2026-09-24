import React from 'react';
import { Home, Wrench, MessageCircle, Activity, FileText, Settings } from 'lucide-react';
import { useApp, AppRoute } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { currentRoute, setCurrentRoute } = useApp();

  const items: { id: AppRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'troubleshoot', label: 'Diagnose', icon: <Wrench className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'machines', label: 'Machines', icon: <Activity className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FED000] border-t-3.5 border-black px-3 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-around max-w-md mx-auto overflow-x-auto">
        {items.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setCurrentRoute(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-black text-[#FED000] px-3 shadow-[2px_2px_0px_#FFFDF8] scale-105'
                  : 'text-black hover:bg-black/10'
              }`}
            >
              <div className="stroke-[2.5]">{item.icon}</div>
              <span className="text-[10px] font-black tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
