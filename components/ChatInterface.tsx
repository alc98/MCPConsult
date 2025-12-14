import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Database, Loader2, Sparkles, User, Bot, BarChart, Lightbulb, X, ArrowRight, Zap, TrendingUp, TrendingDown, ShoppingBag, Mic, Globe, HardDrive, DollarSign, CreditCard, Activity, Map, PieChart, Users, Package, Calculator, Calendar, BrainCircuit, Languages } from 'lucide-react';
import { executeNaturalLanguageQuery } from '../services/mcpService';
import { QueryResult } from '../types';
import { DataChart } from './DataChart';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: QueryResult;
  timestamp: Date;
}

// Helper icon for the new prompts
const TrophyIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const BUSINESS_PROMPTS = [
  // --- EXISTING PROMPTS (KEPT) ---
  // --- External & System MCPs ---
  {
    category: "Financial MCP",
    title: { en: "Convert Currency", es: "Convertir Divisa" },
    prompt: "Convert total revenue to EUR and MXN (Forex MCP)",
    icon: <DollarSign size={18} className="text-green-600" />
  },
  {
    category: "Geo MCP",
    title: { en: "Sales Map", es: "Mapa de Ventas" },
    prompt: "Show me a map of sales by region (Google Maps MCP)",
    icon: <Map size={18} className="text-red-500" />
  },
  {
    category: "Financial MCP",
    title: { en: "Payment Status", es: "Estado Pagos" },
    prompt: "Check Stripe status for recent sales",
    icon: <CreditCard size={18} className="text-violet-500" />
  },
  {
    category: "Financial MCP",
    title: { en: "Crypto Correlation", es: "Cripto Análisis" },
    prompt: "Compare my sales trend with Bitcoin price",
    icon: <Activity size={18} className="text-amber-500" />
  },
  {
    category: "External MCP",
    title: { en: "Market Trends", es: "Tendencias Mercado" },
    prompt: "Compare my sales with global market trends (Brave Search)",
    icon: <Globe size={18} className="text-blue-500" />
  },
  {
    category: "System MCP",
    title: { en: "Export Report", es: "Exportar Reporte" },
    prompt: "Export current sales report to CSV on local disk",
    icon: <HardDrive size={18} className="text-slate-500" />
  },
  {
    category: "Architecture",
    title: { en: "Postgres Schema", es: "Esquema Postgres" },
    prompt: "Diseña un esquema de base de datos optimizado en PostgreSQL y graficalo",
    icon: <Terminal size={18} className="text-slate-600" />
  },
  
  // --- Analytics & General ---
  {
    category: "Analytics",
    title: { en: "Revenue Overview", es: "Resumen Ingresos" },
    prompt: "Calculate total revenue statistics and distribution",
    icon: <BarChart size={18} className="text-pink-500" />
  },
  {
    category: "Inventory",
    title: { en: "Category: Juguetes", es: "Cat: Juguetes" },
    prompt: "Show me all products in Juguetes category with prices",
    icon: <Database size={18} className="text-indigo-500" />
  },
  {
    category: "CRM",
    title: { en: "Customer Region", es: "Región Clientes" },
    prompt: "List customers from the 'Centro' region",
    icon: <User size={18} className="text-orange-500" />
  },

  // --- Sorting & Rankings (High/Low) ---
  {
    category: "HR - High",
    title: { en: "Highest Salaries", es: "Salarios Altos" },
    prompt: "Show me the top 5 employees by salary (Descending)",
    icon: <TrendingUp size={18} className="text-emerald-500" />
  },
  {
    category: "HR - Low",
    title: { en: "Entry Level Salaries", es: "Salarios Bajos" },
    prompt: "Show me the bottom 5 employees by salary (Ascending)",
    icon: <TrendingDown size={18} className="text-lime-600" />
  },
  {
    category: "Sales - High",
    title: { en: "Top Transactions", es: "Top Transacciones" },
    prompt: "Show top 5 sales transactions by total value",
    icon: <Zap size={18} className="text-yellow-500" />
  },
  {
    category: "Products - High",
    title: { en: "Most Expensive", es: "Más Caros" },
    prompt: "List the top 5 most expensive products",
    icon: <ShoppingBag size={18} className="text-purple-500" />
  },

  // --- NEW ADDED PROMPTS ---
  {
    category: "Strategy",
    title: { en: "Sales Channels", es: "Canales Venta" },
    prompt: "Analyze sales distribution by channel (Online vs Physical)",
    icon: <PieChart size={18} className="text-cyan-600" />
  },
  {
    category: "CRM",
    title: { en: "VIP Customers", es: "Clientes VIP" },
    prompt: "List the top 5 customers by total purchase volume",
    icon: <Users size={18} className="text-indigo-600" />
  },
  {
    category: "HR - Performance",
    title: { en: "Top Performers", es: "Mejores Empleados" },
    prompt: "Identify employees with the highest generated revenue",
    icon: <TrophyIcon size={18} className="text-yellow-600" />
  }
];

const UI_TEXT = {
  en: {
    title: "Natural Language Query",
    suggested: "Suggested Actions",
    placeholder: "Ask a question or use voice...",
    thinking: "Thinking & Querying MCPs...",
    visualization: "Visualization",
    results: "results found via PostgreSQL",
    intro: "Hello! I'm your Llama 3 SQL Agent. I can help design database schemas, query your sales data, or visualize trends.\n\nI am now connected to **Brave Search**, **Stripe**, **Forex API**, **Google Maps** and **Filesystem**.",
    viewSource: "View Source",
    mcpLabel: "MCP Source",
    analysisTitle: "AI Business Analysis",
    footerInternal: "Internal: Postgres, Ollama",
    footerExternal: "External MCPs: Brave, Stripe, Forex, AlphaVantage",
    promptLibTitle: "Business Prompt Library"
  },
  es: {
    title: "Consulta en Lenguaje Natural",
    suggested: "Acciones Sugeridas",
    placeholder: "Haz una pregunta o usa voz...",
    thinking: "Pensando y Consultando MCPs...",
    visualization: "Visualización",
    results: "resultados encontrados vía PostgreSQL",
    intro: "¡Hola! Soy tu Agente SQL Llama 3. Puedo ayudarte a diseñar esquemas, consultar datos de ventas o visualizar tendencias.\n\nEstoy conectado a **Brave Search**, **Stripe**, **Forex API**, **Google Maps** y **Filesystem**.",
    viewSource: "Ver Fuente",
    mcpLabel: "Fuente MCP",
    analysisTitle: "Análisis de Negocio IA",
    footerInternal: "Interno: Postgres, Ollama",
    footerExternal: "Externo MCPs: Brave, Stripe, Forex, AlphaVantage",
    promptLibTitle: "Biblioteca de Prompts de Negocio"
  }
};

export const ChatInterface: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: UI_TEXT['en'].intro,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update intro message when language changes if it's the only message
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '1') {
      setMessages([{
        ...messages[0],
        content: UI_TEXT[language].intro
      }]);
    }
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowPrompts(false); // Close prompts if open
    setIsTyping(true);

    try {
      // Pass language to service
      const result = await executeNaturalLanguageQuery(userMsg.content, language);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.explanation || "Here are the results:",
        data: result,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'en' 
          ? "I encountered an error trying to process that request." 
          : "Encontré un error al intentar procesar esa solicitud.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(input);
  };

  const handlePromptSelect = (prompt: string) => {
    processQuery(prompt);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) return;

    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'es' ? 'es-ES' : 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      if (inputRef.current) inputRef.current.focus();
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  // Helper to render content with markdown-like code blocks
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const content = part.slice(3, -3).replace(/^sql|^python/i, '').trim();
        return (
          <pre key={index} className="bg-slate-900 text-slate-100 p-3 rounded-lg my-2 text-xs font-mono overflow-x-auto border border-slate-700">
            {content}
          </pre>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  const t = UI_TEXT[language];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center px-6 justify-between bg-white/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary-500" size={20} />
          <h2 className="font-semibold text-slate-800">{t.title}</h2>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium transition-colors"
           >
             <Languages size={14} />
             {language === 'en' ? 'EN' : 'ES'}
           </button>
           <div className="hidden md:flex gap-2">
             <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200 flex items-center gap-1">
               <BarChart size={12} /> Plotly
             </div>
             <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 flex items-center gap-1">
               <Globe size={12} /> MCPs
             </div>
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-br from-primary-500 to-purple-600 text-white'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Process / Explanation Bubble */}
              <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {renderContent(msg.content)}
              </div>

              {/* Data Result Card */}
              {msg.data && (
                <div className="w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* AI Analysis Section (New) */}
                  {msg.data.analysis && (
                     <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4 border-b border-purple-100">
                        <div className="flex items-center gap-2 mb-2 text-purple-700">
                           <BrainCircuit size={18} />
                           <h4 className="text-sm font-bold uppercase tracking-wide">{t.analysisTitle}</h4>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                           {msg.data.analysis}
                        </p>
                     </div>
                  )}

                  {/* External Context Info (Brave Search / Filesystem / Fintech) */}
                  {msg.data.externalContext && (
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-start gap-3">
                       <div className="bg-white p-1.5 rounded-md shadow-sm text-blue-500 mt-0.5">
                         {msg.data.externalContext.source.includes('Brave') ? <Globe size={16} /> : 
                          msg.data.externalContext.source.includes('Filesystem') ? <HardDrive size={16} /> :
                          msg.data.externalContext.source.includes('Stripe') ? <CreditCard size={16} /> :
                          msg.data.externalContext.source.includes('Maps') ? <Map size={16} /> :
                          <DollarSign size={16} />}
                       </div>
                       <div>
                         <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">
                            {t.mcpLabel}: {msg.data.externalContext.source}
                         </div>
                         <p className="text-sm text-blue-900">{msg.data.externalContext.content}</p>
                         {msg.data.externalContext.url && (
                           <a href={msg.data.externalContext.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800 mt-1 inline-block">
                             {t.viewSource}
                           </a>
                         )}
                       </div>
                    </div>
                  )}

                  {/* Chart Section */}
                  {msg.data.chartConfig && (
                    <div className="p-4 border-b border-slate-100 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart size={16} className="text-purple-500" />
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{t.visualization}</span>
                      </div>
                      <DataChart data={msg.data.chartConfig.data} layout={msg.data.chartConfig.layout} />
                    </div>
                  )}

                  {/* SQL Preview */}
                  {msg.data.sql && !msg.data.sql.startsWith('--') && (
                     <div className="bg-slate-900 px-4 py-2 flex items-center gap-2">
                        <Terminal size={14} className="text-green-400" />
                        <code className="text-xs font-mono text-green-400 flex-1 truncate">{msg.data.sql}</code>
                    </div>
                  )}
                  
                  {/* Table (only if there are rows) */}
                  {msg.data.rows && msg.data.rows.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                          <tr>
                            {msg.data.columns.map((col, i) => (
                              <th key={i} className="px-4 py-2 capitalize">{col.replace(/_/g, ' ')}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {msg.data.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              {msg.data!.columns.map((col, j) => (
                                <td key={j} className="px-4 py-2 text-slate-700 whitespace-nowrap">
                                  {typeof row[col] === 'number' && (col.includes('price') || col.includes('salary') || col.includes('total') || col.includes('value') || col.includes('amount'))
                                    ? `$${Number(row[col]).toLocaleString()}` 
                                    : row[col]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {msg.data.rows.length > 0 && (
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-right">
                      {msg.data.rows.length} {t.results}
                    </div>
                  )}
                </div>
              )}
              
              <span className="text-[10px] text-slate-400 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Visible Starter Prompts (Zero State) */}
        {messages.length === 1 && (
          <div className="max-w-4xl mx-auto mt-6 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-4 text-slate-400">
               <Lightbulb size={16} />
               <span className="text-xs font-medium uppercase tracking-wider">{t.suggested}</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
              {BUSINESS_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptSelect(item.prompt)}
                  className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-primary-50 text-slate-500 group-hover:text-primary-600 transition-colors">
                      {item.icon}
                    </div>
                    {/* Render specific trending/high/low icons based on category text analysis if needed, or rely on item.icon */}
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-800 text-sm mb-1 group-hover:text-primary-700">
                      {language === 'es' ? item.title.es : item.title.en}
                    </span>
                    <p className="text-xs text-slate-500 leading-snug line-clamp-2">{item.prompt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot size={20} />
            </div>
            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-primary-500" size={16} />
              <span className="text-sm text-slate-500">{t.thinking}</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Prompt Library Window */}
      {showPrompts && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" />
                <h3 className="font-semibold text-slate-700 text-sm">{t.promptLibTitle}</h3>
              </div>
              <button 
                onClick={() => setShowPrompts(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {BUSINESS_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                     setInput(item.prompt);
                     setShowPrompts(false);
                     if (inputRef.current) inputRef.current.focus();
                  }}
                  className="flex flex-col items-start gap-2 p-3 rounded-lg border border-slate-100 bg-white hover:border-primary-200 hover:bg-primary-50 hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1.5 bg-slate-50 rounded-md group-hover:bg-white transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-800 text-sm mb-1 group-hover:text-primary-700">
                      {language === 'es' ? item.title.es : item.title.en}
                    </span>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.prompt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 relative">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex gap-2">
           <button
            type="button"
            onClick={() => setShowPrompts(!showPrompts)}
            className={`p-4 rounded-full border transition-all ${
              showPrompts 
                ? 'bg-amber-100 border-amber-200 text-amber-600' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title="Open Prompt Library"
          >
            <Lightbulb size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="w-full pl-6 pr-24 py-4 rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm text-slate-700 placeholder:text-slate-400"
            />
            
            <div className="absolute right-2 top-2 flex gap-1">
               <button 
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-full transition-colors ${
                  isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Voice Input"
              >
                <Mic size={20} />
              </button>
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
        <div className="text-center mt-2 flex justify-center gap-3">
          <p className="text-[10px] text-slate-400">
            {t.footerInternal}
          </p>
          <span className="text-[10px] text-slate-300">|</span>
           <p className="text-[10px] text-slate-400">
            {t.footerExternal}
          </p>
        </div>
      </div>
    </div>
  );
};