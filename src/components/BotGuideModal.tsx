import React from 'react';
import { X, Terminal, CheckCircle2, Download, ExternalLink, ShieldCheck, Flame } from 'lucide-react';

interface BotGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadScript: () => void;
}

export const BotGuideModal: React.FC<BotGuideModalProps> = ({
  isOpen,
  onClose,
  onDownloadScript,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>الدليل الشامل لتشغيل البوت</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            كيف تقوم بتشغيل البوت في VS Code كما في الفيديو؟
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            خطوات سريعة ومجربة لتشغيل كود الأتمتة على حاسوبك (Windows / Mac / Linux) وحجز التذاكر فور طرحها.
          </p>

          <div className="space-y-4 text-xs">
            {/* Step 1 */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-white text-sm">تثبيت بايثون ومتصفح Google Chrome</h4>
              </div>
              <p className="text-slate-300 mr-8 leading-relaxed">
                تأكد من تنزيل بايثون من الموقع الرسمي <span className="text-purple-300 font-mono">python.org</span> وتفعيل خيار <strong className="text-amber-300">Add Python to PATH</strong> أثناء التثبيت، وتحديث متصفح Chrome لآخر إصدار.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-white text-sm">تثبيت مكتبة Undetected Chromedriver</h4>
              </div>
              <p className="text-slate-300 mr-8 leading-relaxed">
                افتح الطرفية (Terminal أو CMD) ونفذ الأمر التالي لتحميل حزمة التشغيل:
              </p>
              <div className="mr-8 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-purple-300 flex justify-between items-center" dir="ltr">
                <span>pip install undetected-chromedriver selenium requests</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0b0e14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-white text-sm">تحميل ملف الكود وتشغيله</h4>
              </div>
              <p className="text-slate-300 mr-8 leading-relaxed">
                اضغط على زر التحميل بالأسفل لحفظ ملف <code className="text-purple-300 font-mono">main.py</code>. ثم افتح المجلد في VS Code أو موجه الأوامر وشغل:
              </p>
              <div className="mr-8 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-emerald-400 flex justify-between items-center" dir="ltr">
                <span>python main.py</span>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl space-y-1 text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>نصيحة ذهبية للحصول على التذاكر:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                شغّل البوت قبل فتح الحجز بـ 3 دقائق ليكون مسجلاً دخوله في الموقع ومستعداً للضغط التلقائي في الجزء من الثانية الأولى عند توفر التذاكر.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onDownloadScript();
                onClose();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تحميل كود main.py الجاهز الآن</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
