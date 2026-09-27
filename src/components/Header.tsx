import React from 'react';
import { 
  Bot, Terminal, Code2, Download, HelpCircle, ShieldCheck, 
  Zap, Map, ShoppingCart, Compass, Sparkles, Ticket 
} from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onDownloadScript: () => void;
  activeTab: 'explore' | 'map' | 'runner' | 'code' | 'accounts' | 'settings';
  setActiveTab: (tab: 'explore' | 'map' | 'runner' | 'code' | 'accounts' | 'settings') => void;
  botStatus: 'idle' | 'running' | 'success' | 'failed';
  accountsCount: number;
  selectedSeatsCount: number;
  onOpenBookings?: () => void;
  bookingsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onDownloadScript,
  activeTab,
  setActiveTab,
  botStatus,
  accountsCount,
  selectedSeatsCount,
  onOpenBookings,
  bookingsCount = 0,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#07090e]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff007a] via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-pink-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-pink-400" />
                </div>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                botStatus === 'running' 
                  ? 'bg-amber-400 animate-ping' 
                  : 'bg-emerald-500'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Webook Auto-Seat Sniper
                </h1>
                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold bg-[#ff007a]/20 text-[#ff007a] border border-[#ff007a]/40 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Live Webook Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                منصة استكشاف فعاليات Webook الرسمية وحجز المقاعد التلقائي
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('runner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'runner'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400'
                  : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>بوت الويب المباشر ⚡</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-[#ff007a] to-rose-600 text-white shadow-md shadow-pink-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-pink-400" />
              <span>منصة Webook الرسمية</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-amber-400" />
              <span>مخطط المقاعد</span>
              {selectedSeatsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full">
                  {selectedSeatsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>الحسابات ({accountsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>كود بايثون</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-pink-400" />
              <span>الإعدادات</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenBookings && (
              <button
                onClick={onOpenBookings}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5 text-[#ff007a]" />
                <span>حجوزاتي</span>
                {bookingsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full">
                    {bookingsCount}
                  </span>
                )}
              </button>
            )}

            <a
              href="https://webook.com/ar/explore"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 rounded-lg border border-emerald-500/40 transition"
              title="فحص سلة Webook الرسمية"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>سلة Webook</span>
            </a>

            <button
              onClick={onOpenGuide}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg border border-slate-700/60 transition cursor-pointer"
            >
              دليل الاستخدام
            </button>

            <button
              onClick={onDownloadScript}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-md shadow-purple-600/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل main.py</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('runner')}
            className={`px-3 py-1.5 text-xs rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-black transition-all ${
              activeTab === 'runner'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>بوت الويب ⚡</span>
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-2.5 py-1 text-xs rounded-md flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeTab === 'explore' ? 'bg-[#ff007a] text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>منصة Webook</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 text-xs rounded-md flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeTab === 'map' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Map className="w-3 h-3" />
            <span>المخطط</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-2.5 py-1 text-xs rounded-md cursor-pointer ${
              activeTab === 'accounts' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            الحسابات ({accountsCount})
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 text-xs rounded-md cursor-pointer ${
              activeTab === 'code' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            الكود
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 text-xs rounded-md cursor-pointer ${
              activeTab === 'settings' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            الإعدادات
          </button>
        </div>
      </div>
    </header>
  );
};
