import React, { useState, useEffect } from 'react';
import { 
  Radio, RefreshCw, CheckCircle2, Globe, Clock, 
  Layers, Zap, ShieldCheck, ExternalLink, Sparkles 
} from 'lucide-react';
import { WebookSyncStatus } from '../services/webookSyncService';

interface LiveWebookSyncBannerProps {
  status: WebookSyncStatus;
  onForceSync: () => void;
  selectedEventTitle: string;
}

export const LiveWebookSyncBanner: React.FC<LiveWebookSyncBannerProps> = ({
  status,
  onForceSync,
  selectedEventTitle,
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status.lastSyncTimestamp]);

  return (
    <div className="bg-gradient-to-r from-[#0d121f] via-[#111827] to-[#0d121f] border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        {/* Left: Live Connection & Status */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>بث حي متزامن تلقائياً مع webook.com</span>
            </span>

            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>آخر جلب تلقائي: منذ {secondsAgo} ثانية</span>
            </span>

            <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800">
              {status.totalEventsSynced} فعالية رسمية مسحوبة
            </span>

            <span className="text-[11px] text-purple-300 bg-purple-950/40 px-2.5 py-0.5 rounded-lg border border-purple-800/60 font-medium">
              تزامن تلقائي دوري • بدون فعاليات تجريبية
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>تم جلب الفعاليات ومخططات المقاعد تلقائياً من Webook</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            يقوم النظام بالاتصال الدوري بمنصة Webook، وجلب كافة الفعاليات النشطة (موسم الرياض، دوري روشن، المسارح، والحفلات) مع بناء مخطط المقاعد الخاص بكل فعالية وتجهيز الحجز المباشر في سلتك الرسمية.
          </p>
        </div>

        {/* Right: Quick Actions & Sync Trigger */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block">الفعالية المحددة للمقاعد:</span>
            <span className="text-xs font-bold text-purple-300 truncate max-w-[200px] inline-block font-mono">
              {selectedEventTitle}
            </span>
          </div>

          <button
            onClick={onForceSync}
            disabled={status.isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-md cursor-pointer ${
              status.isSyncing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status.isSyncing ? 'animate-spin text-purple-400' : ''}`} />
            <span>{status.isSyncing ? 'جاري جلب الفعاليات...' : 'تحديث البيانات الآن'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
