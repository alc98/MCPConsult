import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { TablesView } from './components/TablesView';
import { ViewMode } from './types';
import { Settings, CheckCircle2, Server, Database } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.CHAT);

  const renderContent = () => {
    switch (currentView) {
      case ViewMode.CHAT:
        return <ChatInterface />;
      case ViewMode.TABLES:
        return <TablesView />;
      case ViewMode.SETTINGS:
        return <SettingsView />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

// Simple Settings View Component
const SettingsView = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-slate-900 mb-6">System Configuration</h1>
    
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Server className="text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-800">MCP Server Configuration</h2>
        </div>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ollama Endpoint</label>
            <div className="flex gap-2">
              <input type="text" value="http://localhost:11434" disabled className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium px-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle2 size={16} /> Connected
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model Selection</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700">
              <option>llama3:latest</option>
              <option>mistral</option>
              <option>phi3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-800">Database Connection</h2>
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Host</label>
              <input type="text" value="localhost" disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
              <input type="text" value="5432" disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Database Name</label>
            <input type="text" value="business_db_csv_import" disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Schema loaded: products, employees, customers, users, sales
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default App;