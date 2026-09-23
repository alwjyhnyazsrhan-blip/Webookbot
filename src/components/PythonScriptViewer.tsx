import React, { useState } from 'react';
import { Code2, Copy, Check, Download, FileText, Terminal, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { Account, BotConfig, WebookEvent, Seat } from '../types/bot';
import { 
  generateSeleniumPythonScript, 
  generatePlaywrightPythonScript, 
  generateRequirementsTxt,
  generateInstallationGuide
} from '../utils/codeGenerators';

interface PythonScriptViewerProps {
  accounts: Account[];
  config: BotConfig;
  event: WebookEvent;
  selectedSeats?: Seat[];
}

export const PythonScriptViewer: React.FC<PythonScriptViewerProps> = ({
  accounts,
  config,
  event,
  selectedSeats,
}) => {
  const [activeFile, setActiveFile] = useState<'main.py' | 'playwright.py' | 'requirements.txt' | 'README.md'>('main.py');
  const [copied, setCopied] = useState<boolean>(false);

  const seleniumCode = generateSeleniumPythonScript(accounts, config, event, selectedSeats);
  const playwrightCode = generatePlaywrightPythonScript(accounts, config, event);
  const requirementsTxt = generateRequirementsTxt();
  const readmeContent = generateInstallationGuide();

  const getCurrentContent = () => {
    switch (activeFile) {
      case 'main.py':
        return seleniumCode;
      case 'playwright.py':
        return playwrightCode;
      case 'requirements.txt':
        return requirementsTxt;
      case 'README.md':
        return readmeContent;
      default:
        return seleniumCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getCurrentContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>كود بايثون متكامل وجاهز للتشغيل المحلي (Python Automation Script)</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-mono">
                Selenium + Undetected Chrome
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              هذا الكود متطابق مع كود الفيديو الظاهر في VS Code ويستخدم مكتبة <code className="text-purple-300 font-mono">undetected-chromedriver</code> لتخطي حماية Cloudflare وصفحة انتظار Webook تلقائياً.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ الكود'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل {activeFile}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="bg-[#0b0e14] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Tabs Bar */}
        <div className="bg-[#121620] px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFile('main.py')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeFile === 'main.py'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-yellow-400" />
              <span>main.py (Selenium)</span>
            </button>

            <button
              onClick={() => setActiveFile('playwright.py')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeFile === 'playwright.py'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>playwright_sniper.py</span>
            </button>

            <button
              onClick={() => setActiveFile('requirements.txt')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeFile === 'requirements.txt'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>requirements.txt</span>
            </button>

            <button
              onClick={() => setActiveFile('README.md')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition ${
                activeFile === 'README.md'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-pink-400" />
              <span>README.md (دليل التشغيل)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            UTF-8 • CRLF/LF • Python 3.x
          </span>
        </div>

        {/* Code Content Area with Line Numbers */}
        <div className="relative p-4 font-mono text-xs overflow-x-auto bg-[#07090e] max-h-[580px] text-slate-300 leading-relaxed">
          <pre dir="ltr" className="font-mono whitespace-pre select-text">
            {getCurrentContent()}
          </pre>
        </div>
      </div>

      {/* Execution Instructions Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>طريقة تشغيل البوت على جهازك في 3 خطوات بسيطة:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <p className="font-bold text-slate-200">تثبيت المكتبات المطلوبة</p>
            <p className="text-slate-400">افتح موجه الأوامر (CMD أو Terminal) واكتب:</p>
            <code className="block bg-slate-950 p-2 rounded text-[11px] text-purple-300 font-mono" dir="ltr">
              pip install undetected-chromedriver selenium requests
            </code>
          </div>

          <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <p className="font-bold text-slate-200">حفظ الملف وتحديث البيانات</p>
            <p className="text-slate-400">اضغط على زر <span className="text-purple-400">تحميل main.py</span> وضعه في مجلد مستقل وتأكد من كتابة إيميلك وكلمة مرورك في قائمة الحسابات.</p>
          </div>

          <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <p className="font-bold text-slate-200">تشغيل البوت للحجز</p>
            <p className="text-slate-400">شغل البرنامج فوراً ليقوم بفتح متصفح Chrome وحجز التذاكر تلقائياً:</p>
            <code className="block bg-slate-950 p-2 rounded text-[11px] text-emerald-400 font-mono" dir="ltr">
              python main.py
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
