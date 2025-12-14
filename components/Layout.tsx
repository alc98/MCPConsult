import React from 'react';
import { Bot, Database, Settings, LayoutDashboard, Menu, ShieldCheck } from 'lucide-react';
import { ViewMode } from '../types';

interface LayoutProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              L
            </div>
            {isSidebarOpen && <span className="font-semibold text-white tracking-tight">Llama<span className="text-blue-400">MCP</span></span>}
          </div>
          {isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} className="hover:text-white">
              <Menu size={20} />
            </button>
          )}
        </div>

        {!isSidebarOpen && (
           <div className="flex justify-center py-4">
             <button onClick={() => setIsSidebarOpen(true)} className="hover:text-white">
                <Menu size={20} />
             </button>
           </div>
        )}

        <nav className="flex-1 py-6 space-y-2 px-2">
          <NavItem 
            icon={<Bot size={22} />} 
            label="Llama Assistant" 
            isActive={currentView === ViewMode.CHAT}
            isOpen={isSidebarOpen}
            onClick={() => onViewChange(ViewMode.CHAT)}
          />
          <NavItem 
            icon={<Database size={22} />} 
            label="Postgres Data" 
            isActive={currentView === ViewMode.TABLES}
            isOpen={isSidebarOpen}
            onClick={() => onViewChange(ViewMode.TABLES)}
          />
          <div className="pt-4 mt-4 border-t border-slate-800">
            <NavItem 
              icon={<Settings size={22} />} 
              label="Configuration" 
              isActive={currentView === ViewMode.SETTINGS}
              isOpen={isSidebarOpen}
              onClick={() => onViewChange(ViewMode.SETTINGS)}
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-400">Ollama: Connected</span>
                <span className="text-xs font-medium text-slate-400">Postgres: Active</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, isOpen, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
        : 'hover:bg-slate-800 hover:text-white'
    } ${!isOpen && 'justify-center'}`}
  >
    {icon}
    {isOpen && <span className="font-medium text-sm">{label}</span>}
  </button>
);