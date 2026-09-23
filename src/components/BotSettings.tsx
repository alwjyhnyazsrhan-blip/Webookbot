import React from 'react';
import { Sliders, Bell, Send, ShieldAlert, Cpu, Eye, EyeOff, Check, Info } from 'lucide-react';
import { BotConfig } from '../types/bot';

interface BotSettingsProps {
  config: BotConfig;
  onUpdateConfig: (newConfig: Partial<BotConfig>) => void;
}

export const BotSettings: React.FC<BotSettingsProps> = ({
  config,
  onUpdateConfig,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-purple-400" />
          <span>إعدادات سرعة وقوة البوت (Bot Tuning & Performance)</span>
        </h3>
        <p className="text-xs text-slate-400">
          خصص خوارزمية الحجز، أوقات الانتظار، ونظام إشعارات تليجرام عند اكتمال الحجز.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Left Column: Automation Engine Tuning */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>محرك المتصفح والأتمتة</span>
            </h4>

            {/* Headless Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">تشغيل خفي (Headless Mode)</span>
                <span className="text-[11px] text-slate-400">
                  تشغيل المتصفح في الخلفية بدون فتح نافذة مرئية لتوفير استهلاك الذاكرة والسرعة
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateConfig({ headless: !config.headless })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  config.headless ? 'bg-purple-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>

            {/* Typing Delay */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">تأخير الكتابة البشري (Human Typing Delay)</span>
                <span className="font-mono text-purple-300 font-bold">{config.typingDelayMs} ms</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={config.typingDelayMs}
                onChange={(e) => onUpdateConfig({ typingDelayMs: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                تأخير أقل يعني سرعة قنص أعلى، بينما التأخير المتوسط (30-60ms) يتفادى كشف الروبوت تماماً.
              </span>
            </div>

            {/* Auto Retry Interval */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">معدل إعادة المحاولة عند نفاد التذاكر</span>
                <span className="font-mono text-purple-300 font-bold">{config.retryIntervalMs} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={config.retryIntervalMs}
                onChange={(e) => onUpdateConfig({ retryIntervalMs: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                الفاصل الزمني لإعادة فحص توفر التذاكر عند إلغاء حجز شخص آخر.
              </span>
            </div>
          </div>

          {/* Right Column: Telegram Notifications & Alerts */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>إشعارات تليجرام الفورية (Telegram Alerts)</span>
            </h4>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">تفعيل إشعارات تليجرام</span>
                  <span className="text-[11px] text-slate-400">
                    استلم رسالة على هاتفك فور قيام البوت بوضع التذاكر في السلة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ notifyTelegram: !config.notifyTelegram })}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    config.notifyTelegram ? 'bg-purple-600 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>

              {config.notifyTelegram && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                      value={config.telegramBotToken}
                      onChange={(e) => onUpdateConfig({ telegramBotToken: e.target.value })}
                      className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Telegram Chat ID
                    </label>
                    <input
                      type="text"
                      placeholder="987654321"
                      value={config.telegramChatId}
                      onChange={(e) => onUpdateConfig({ telegramChatId: e.target.value })}
                      className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Anti-Ban & Cloudflare note */}
            <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl text-xs space-y-1.5 text-purple-200">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Info className="w-4 h-4 text-purple-400" />
                <span>حماية متطورة ضد الحظر (Cloudflare Stealth)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                يستخدم كود البوت مكتبة <code className="text-purple-300 font-mono">undetected-chromedriver</code> والتي تقوم بتعديل بصمة المتصفح (Browser Fingerprint) وإخفاء متغيرات WebDriver لمنع ظهور صفحة الكابتشا أو Cloudflare Turnstile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
