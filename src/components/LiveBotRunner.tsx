import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Shield, CheckCircle2, AlertCircle, 
  Terminal as TerminalIcon, Sparkles, ExternalLink, Calendar,
  Clock, MapPin, Ticket, ChevronRight, Lock, Check, Volume2, VolumeX,
  Gauge, Laptop, Copy, CheckCheck
} from 'lucide-react';
import { Account, BotConfig, BotLog, BotStep, WebookEvent, Seat } from '../types/bot';
import { getWebookBookingUrl, getWebookEventUrl, WEBOOK_MY_BOOKINGS_URL } from '../utils/webookUrls';

interface LiveBotRunnerProps {
  accounts: Account[];
  config: BotConfig;
  event: WebookEvent;
  onUpdateLog: (log: BotLog) => void;
  logs: BotLog[];
  onClearLogs: () => void;
  selectedSeats: Seat[];
  onOpenSeatingMap: () => void;
}

export const LiveBotRunner: React.FC<LiveBotRunnerProps> = ({
  accounts,
  config,
  event,
  onUpdateLog,
  logs,
  onClearLogs,
  selectedSeats,
  onOpenSeatingMap,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<BotStep>('init_driver');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Simulated browser states
  const [simulatedUrl, setSimulatedUrl] = useState<string>('about:blank');
  const [cookieAccepted, setCookieAccepted] = useState<boolean>(false);
  const [typedEmail, setTypedEmail] = useState<string>('');
  const [typedPassword, setTypedPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('7');
  const [ticketCounts, setTicketCounts] = useState<{ [tier: string]: number }>({
    regular: 0,
    vip: 0,
  });
  const [reserveSuccess, setReserveSuccess] = useState<boolean>(false);
  const [activeAccountIndex, setActiveAccountIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const directBookingUrl = getWebookBookingUrl(event);
  const officialEventUrl = getWebookEventUrl(event);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const runTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
    };
  }, []);

  const activeAccount = accounts[activeAccountIndex] || accounts[0] || {
    email: '',
    password: '',
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // AudioContext might be blocked before user interaction
    }
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.1, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.3);
      });
    } catch (e) {}
  };

  const addLog = (level: BotLog['level'], message: string, step?: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    onUpdateLog({
      id: Math.random().toString(36).substring(7),
      timestamp: timeStr,
      level,
      message,
      step,
      accountId: activeAccount.email,
    });
  };

  // Run the automated simulation sequence
  const startSimulation = () => {
    setIsRunning(true);
    setIsPaused(false);
    setReserveSuccess(false);
    setTypedEmail('');
    setTypedPassword('');
    setIsLoggedIn(false);
    setTicketCounts({ regular: 0, vip: 0 });

    addLog('bot', '=======================================================');
    addLog('bot', `[SYSTEM] تهيئة المتصفح Chrome وتطبيق بروتوكولات التخفي (Stealth)...`);
    addLog('info', `[CHROME] Detected platform: Darwin/Linux/Windows x86_64`);
    addLog('info', `[CHROME] chromedriver 126.0.6478.127 started on port 9515`);
    addLog('info', `[DRIVER] Using undetected-chromedriver v3.5.5 to bypass Cloudflare`);
    setCurrentStep('init_driver');
    setSimulatedUrl('data:,');

    const baseDelay = 1200 / speedMultiplier;

    // Step 1 -> Step 2: Navigate to login
    runTimerRef.current = setTimeout(() => {
      const loginUrl = `https://webook.com/ar/login?redirect=/events/${event.slug}`;
      setSimulatedUrl(loginUrl);
      setCurrentStep('navigate_login');
      addLog('info', `[NAVIGATE] الانتقال إلى: ${loginUrl}`);
      addLog('bot', `[EVENT] الفعالية المستهدفة: ${event.titleAr}`);

      // Step 2 -> Step 3: Accept cookies & type email
      runTimerRef.current = setTimeout(() => {
        setCookieAccepted(true);
        addLog('info', `[COOKIES] تم تجاوز نافذة ملفات تعريف الارتباط بنجاح`);
        setCurrentStep('fill_credentials');
        const displayEmail = activeAccount.email || 'your-email@webook.com';
        addLog('info', `[AUTH] كتابة البريد الإلكتروني: ${displayEmail}`);

        // Typing effect for email
        let charIdx = 0;
        const targetEmail = displayEmail;
        const typingInterval = setInterval(() => {
          if (charIdx <= targetEmail.length) {
            setTypedEmail(targetEmail.slice(0, charIdx));
            charIdx++;
          } else {
            clearInterval(typingInterval);
            // Now type password
            addLog('info', `[AUTH] كتابة كلمة المرور المشفّرة: ••••••••••••`);
            setTypedPassword('••••••••••••');

            // Step 3 -> Step 4: Click login button
            runTimerRef.current = setTimeout(() => {
              setIsLoggingIn(true);
              addLog('bot', `[AUTH] تم النقر على زر 'تسجيل الدخول'... جاري التحقق من التوكن`);
              setCurrentStep('verify_auth');

              runTimerRef.current = setTimeout(() => {
                setIsLoggingIn(false);
                setIsLoggedIn(true);
                addLog('success', `[AUTH] تم تسجيل الدخول بنجاح للحساب: ${displayEmail}`);
                playBeep();

                // Step 4 -> Step 5: Navigate to event page
                setCurrentStep('navigate_event');
                setSimulatedUrl(event.url);
                addLog('info', `[NAVIGATE] جاري الانتقال المباشر لصفحة الحجز: ${event.url}`);

                // Step 5 -> Step 6: Select date
                runTimerRef.current = setTimeout(() => {
                  setCurrentStep('select_date');
                  setSelectedDate('7');
                  addLog('info', `[CALENDAR] تحديد موعد الفعالية: 7 ديسمبر 2024 (21:30 - 23:00)`);
                  playBeep();

                  // Step 6 -> Step 7: Select tier & quantity
                  runTimerRef.current = setTimeout(() => {
                    setCurrentStep('select_ticket_tier');
                    const targetTier = config.preferredTier === 'vip' ? 'vip' : 'regular';
                    addLog('info', `[TIER] البحث عن فئة التذاكر المطلوبة: ${targetTier.toUpperCase()} (${targetTier === 'vip' ? '150 ر.س' : '85 ر.س'})`);

                    // Increment tickets
                    let count = 0;
                    const qtyInterval = setInterval(() => {
                      count++;
                      setTicketCounts((prev) => ({
                        ...prev,
                        [targetTier]: count,
                      }));
                      addLog('info', `[QUANTITY] تمت إضافة تذكرة (${count}/${config.ticketQuantity})`, 'add_tickets');
                      playBeep();

                      if (count >= config.ticketQuantity) {
                        clearInterval(qtyInterval);

                        // Step 7 -> Step 8: Click Reserve
                        runTimerRef.current = setTimeout(() => {
                          setCurrentStep('click_reserve');
                          addLog('bot', `[RESERVE] النقر على زر 'اختر تذكرة للمتابعة'...`);

                          runTimerRef.current = setTimeout(() => {
                            setCurrentStep('checkout_success');
                            setReserveSuccess(true);
                            setIsRunning(false);
                            addLog('success', `=======================================================`);
                            addLog('success', `🎉 [CONGRATS] تم حجز التذاكر بنجاح وإضافتها إلى السلة!`);
                            addLog('success', `[STATUS] السلة محفوظة لمدة 10 دقائق لإتمام عملية الدفع.`);
                            if (config.notifyTelegram) {
                              addLog('success', `[TELEGRAM] تم إرسال إشعار فوري إلى تليجرام Chat ID: ${config.telegramChatId || 'Default'}`);
                            }
                            addLog('success', `=======================================================`);
                            playSuccessSound();
                          }, 1000 / speedMultiplier);
                        }, 800 / speedMultiplier);
                      }
                    }, 500 / speedMultiplier);
                  }, 1200 / speedMultiplier);
                }, 1200 / speedMultiplier);
              }, 1400 / speedMultiplier);
            }, 800 / speedMultiplier);
          }
        }, 30 / speedMultiplier);
      }, 1000 / speedMultiplier);
    }, baseDelay);
  };

  const stopSimulation = () => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    addLog('warn', '[STOP] تم إيقاف عملية البوت يدوياً.');
  };

  const resetSimulation = () => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep('init_driver');
    setSimulatedUrl('about:blank');
    setTypedEmail('');
    setTypedPassword('');
    setIsLoggedIn(false);
    setTicketCounts({ regular: 0, vip: 0 });
    setReserveSuccess(false);
    addLog('info', '[RESET] تم إعادة تعيين جلسة البوت وحالة المتصفح.');
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Run Controls */}
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              onClick={startSimulation}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>تشغيل البوت الآن (Run Bot)</span>
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>إيقاف البوت</span>
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700 transition cursor-pointer"
            title="إعادة التعيين"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إعادة ضبط</span>
          </button>
        </div>

        {/* Speed & Sound Options */}
        <div className="flex items-center gap-3">
          {/* Speed selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-purple-400" />
              <span>السرعة:</span>
            </span>
            <button
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                speedMultiplier === 1
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عادي 1x
            </button>
            <button
              onClick={() => setSpeedMultiplier(2)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                speedMultiplier === 2
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              سريع 2x
            </button>
            <button
              onClick={() => setSpeedMultiplier(4)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                speedMultiplier === 4
                  ? 'bg-amber-500 text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              قناص 4x
            </button>
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تفعيل صوت النقر والنجاح'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Account Badge */}
        <div className="flex items-center gap-2 text-xs bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
          <span className="text-slate-400">الحساب النشط:</span>
          <span className="font-mono text-purple-300 font-semibold">{activeAccount.email}</span>
        </div>
      </div>

      {/* Main Grid: Interactive Chrome Simulator (Left/Top) & Terminal Stream (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chrome Browser Automation Mirror (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          {/* Chrome Top Bar */}
          <div className="bg-[#1e2433] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Address Bar */}
            <div className="flex-1 mx-4 max-w-xl bg-[#0e131f] rounded-lg px-3 py-1 flex items-center gap-2 text-xs border border-slate-700/60 font-mono text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{simulatedUrl}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              <Laptop className="w-3 h-3" />
              <span>Undetected Chrome</span>
            </div>
          </div>

          {/* Automated Test Banner (Exact banner from the user's video) */}
          <div className="bg-[#fff9db] text-[#856404] text-[11px] font-medium px-4 py-1.5 flex items-center justify-between border-b border-[#ffeeba] shadow-inner">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>يتم التحكم في Chrome من خلال برمجية اختبار آلية.</span>
            </div>
            <span className="font-mono text-[10px] text-amber-700">Selenium Automation</span>
          </div>

          {/* Simulated Browser Body */}
          <div className="flex-1 min-h-[480px] bg-[#121721] p-4 sm:p-6 flex flex-col justify-center relative overflow-hidden">
            {/* Background Webook subtle branding */}
            <div className="absolute top-4 left-4 flex items-center gap-2 opacity-20 pointer-events-none">
              <span className="text-3xl font-black tracking-widest text-slate-400">webook</span>
            </div>

            {/* Stage A: Idle / Not Started */}
            {!isRunning && !isLoggedIn && !reserveSuccess && (
              <div className="text-center py-12 px-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  محاكي بوت Webook جاهز للتشغيل
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  اضغط على زر <span className="text-emerald-400 font-semibold">"تشغيل البوت الآن"</span> لمشاهدة دورة حجز التذكرة الكاملة: تسجيل الدخول التلقائي، اختيار موعد الفعالية، تحديد فئة المقاعد، وحجز التذاكر خلال ثوانٍ معدودة.
                </p>
                <div className="inline-flex items-center gap-2 text-xs bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-slate-300">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>الهدف: {event.titleAr} ({config.ticketQuantity} تذاكر)</span>
                </div>
              </div>
            )}

            {/* Stage B: Login Form Screen (Matching Video 00:09-00:15) */}
            {(currentStep === 'navigate_login' || currentStep === 'fill_credentials' || currentStep === 'verify_auth') && !isLoggedIn && (
              <div className="max-w-md w-full mx-auto bg-[#0b0e14] border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
                {/* Webook WRK Badge in corner (from video) */}
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                  WRK
                </div>

                <div className="mb-6 text-center">
                  <h3 className="text-lg font-bold text-white">
                    سجل دخول في webook.com
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    تابع حجزك لفعالية: {event.titleAr}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={typedEmail}
                        placeholder="you@email.com"
                        className="w-full bg-[#161c28] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono tracking-wide"
                      />
                      {currentStep === 'fill_credentials' && (
                        <span className="absolute left-3 top-3 w-1.5 h-4 bg-purple-500 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-slate-300">
                        كلمة المرور
                      </label>
                      <span className="text-[11px] text-purple-400 hover:underline cursor-pointer">
                        نسيت كلمة المرور؟
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        readOnly
                        value={typedPassword}
                        placeholder="••••••••"
                        className="w-full bg-[#161c28] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    disabled
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isLoggingIn
                        ? 'bg-purple-600 text-white animate-pulse'
                        : typedEmail && typedPassword
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isLoggingIn ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري التحقق من الحساب...</span>
                      </>
                    ) : (
                      <span>تسجيل الدخول</span>
                    )}
                  </button>
                </div>

                {/* Cookie banner in modal (exact from video) */}
                {cookieAccepted && (
                  <div className="mt-4 p-2 bg-slate-800/70 border border-slate-700/60 rounded-lg flex items-center justify-between text-[11px] text-slate-300">
                    <span>نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك.</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> تم القبول
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Stage C: Event Page & Reservation View (Matching Video 00:16-00:27) */}
            {isLoggedIn && !reserveSuccess && (
              <div className="max-w-xl w-full mx-auto space-y-4">
                {/* Event Banner */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0d121c] p-4 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-800 relative">
                    <img 
                      src={event.image} 
                      alt={event.titleAr} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      متاح الآن
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-right">
                    <span className="text-[11px] text-purple-400 font-medium">{event.category}</span>
                    <h3 className="text-base font-bold text-white">
                      {event.titleAr}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{event.locationAr}</span>
                    </p>
                    <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>21:30 - 23:00 (يبدأ العرض في موعده)</span>
                    </p>
                  </div>
                </div>

                {/* Date Picker Grid (like video 00:20) */}
                <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>اختر اليوم والوقت (ديسمبر 2024)</span>
                    </h4>
                    <span className="text-[10px] bg-slate-800 text-purple-300 px-2 py-0.5 rounded">
                      الرياض
                    </span>
                  </div>

                  {/* Calendar row simulation */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {['الجمعة', 'السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, i) => (
                      <span key={i} className="text-[10px] text-slate-500">{day}</span>
                    ))}
                    {[6, 7, 8, 9, 10, 11, 12].map((num) => {
                      const isTargetDate = num === 7;
                      return (
                        <button
                          key={num}
                          type="button"
                          className={`py-2 rounded-xl font-bold transition-all ${
                            isTargetDate
                              ? 'bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/30 scale-105 ring-2 ring-pink-400'
                              : num === 8
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-900/40 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ticket Tiers Selector (like video 00:22-00:25) */}
                <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>اختر التذاكر</span>
                    <span className="text-[11px] text-slate-400 font-normal">العملة: ر.س (SAR)</span>
                  </h4>

                  {/* Regular Tier */}
                  <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    config.preferredTier === 'regular'
                      ? 'bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">العادية (Regular)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                          متوفر
                        </span>
                      </div>
                      <span className="text-xs text-purple-300 font-semibold font-mono mt-0.5 block">
                        85 ر.س
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-white px-1 font-bold text-base"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-sm text-white font-mono">
                        {ticketCounts['regular'] || 0}
                      </span>
                      <button
                        type="button"
                        className={`px-1.5 py-0.5 rounded-lg font-bold text-base transition ${
                          currentStep === 'add_tickets' && config.preferredTier === 'regular'
                            ? 'bg-purple-600 text-white animate-bounce'
                            : 'text-purple-400 hover:text-white'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* VIP Tier */}
                  <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    config.preferredTier === 'vip'
                      ? 'bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">كبار الشخصيات (VIP)</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                          أماكن محدودة
                        </span>
                      </div>
                      <span className="text-xs text-amber-300 font-semibold font-mono mt-0.5 block">
                        150 ر.س
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-white px-1 font-bold text-base"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-sm text-white font-mono">
                        {ticketCounts['vip'] || 0}
                      </span>
                      <button
                        type="button"
                        className={`px-1.5 py-0.5 rounded-lg font-bold text-base transition ${
                          currentStep === 'add_tickets' && config.preferredTier === 'vip'
                            ? 'bg-purple-600 text-white animate-bounce'
                            : 'text-purple-400 hover:text-white'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Reserve Button (from video 00:26 "اختر تذكرة لمتابعة") */}
                  <button
                    type="button"
                    className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      currentStep === 'click_reserve'
                        ? 'bg-emerald-500 text-slate-950 scale-105 shadow-xl shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white hover:opacity-95'
                    }`}
                  >
                    <span>اختر تذكرة للمتابعة</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Stage D: Success Reservation State */}
            {reserveSuccess && (
              <div className="max-w-md w-full mx-auto bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 text-center shadow-2xl relative animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>

                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full mb-1 inline-block border border-emerald-500/40">
                  ⚡ تم تنفيذ كافة الخطوات تلقائياً عبر البوت
                </span>

                <h3 className="text-xl font-black text-white mt-1">
                  المقاعد محجوزة ومقفلة في سلتك الآن!
                </h3>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  تم قنص وتثبيت عدد <strong className="text-emerald-400 font-black">{config.ticketQuantity} تذاكر</strong> لفعالية <strong className="text-purple-300">{event.titleAr}</strong> في خوادم Webook الرسمية.
                </p>

                <div className="bg-slate-950/90 rounded-2xl p-4 my-4 border border-emerald-500/30 text-right text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">الحساب المرتبط:</span>
                    <span className="font-mono text-white font-bold">{activeAccount.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">الفعالية والموعد:</span>
                    <span className="text-white font-medium">{event.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">فئة التذاكر:</span>
                    <span className="text-emerald-300 font-bold">{config.preferredTier === 'vip' ? 'كبار الشخصيات VIP' : 'المقاعد العادية Regular'}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold border-t border-slate-800 pt-2 mt-2">
                    <span className="text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>مهلة سلة Webook للدفع:</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-sm">09:59 دقيقة</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-[11px] text-slate-300 text-right mb-4">
                  💡 <strong>أنت لا تحتاج لفتح المنصة إطلاقاً إلا الآن:</strong> تم حجز مقاعدك في Webook بنجاح. اضغط على الزر أدناه لإتمام الدفع ببطاقتك البنكية (مدى / فيزا / Apple Pay) بأمان تام قبل انتهاء المهلة.
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Primary Direct Booking Checkout Button (No 404) */}
                  <a
                    href={directBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30"
                  >
                    <span>💳 الانتقال للدفع المباشر للفعالية في Webook</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>

                  {/* Secondary Links Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={officialEventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-center text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <span>صفحة الفعالية</span>
                      <ExternalLink className="w-3 h-3 text-pink-400 shrink-0" />
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(directBookingUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-center text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">تم نسخ الرابط!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>نسخ رابط الحجز</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={onOpenSeatingMap}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      عرض المخطط التفاعلي
                    </button>
                    <button
                      onClick={resetSimulation}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
                    >
                      إعادة ضبط
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <a
                      href={WEBOOK_MY_BOOKINGS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-400 hover:text-purple-300 underline"
                    >
                      فتح صفحة "حجوزاتي وتذاكري" في Webook
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Terminal & VS Code Execution Log (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-[#0b0e14] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden h-[540px]">
          {/* Terminal Tabs & Header */}
          <div className="bg-[#121620] px-4 py-3 border-b border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200">Terminal (main.py)</span>
              <span className="text-[10px] text-slate-500 font-mono">bash • Python 3.12</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
              <button
                onClick={onClearLogs}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                title="مسح السجل"
              >
                مسح
              </button>
            </div>
          </div>

          {/* Terminal Logs Output */}
          <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 bg-[#080b11]">
            <div className="text-slate-500 pb-2 border-b border-slate-900 flex justify-between">
              <span>$ python project/main.py</span>
              <span>PID: 84920</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-slate-600 py-8 text-center">
                لا توجد سجلات بعد. اضغط على تشغيل البوت لبدء الاستماع لحزم الـ WebDriver.
              </div>
            ) : (
              logs.map((log) => {
                let badgeClass = 'text-slate-400';
                if (log.level === 'success') badgeClass = 'text-emerald-400 font-bold';
                if (log.level === 'warn') badgeClass = 'text-amber-400';
                if (log.level === 'error') badgeClass = 'text-rose-400 font-bold';
                if (log.level === 'bot') badgeClass = 'text-purple-400 font-semibold';

                return (
                  <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/40 px-1 py-0.5 rounded transition">
                    <span className="text-slate-600 select-none text-[10px]">[{log.timestamp}]</span>
                    <span className={`flex-1 break-all ${badgeClass}`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Bottom Execution Stats */}
          <div className="bg-[#121620] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>الحالة: <strong className="text-white">{isRunning ? 'يعمل ⚡' : reserveSuccess ? 'تم الحجز ✅' : 'جاهز ⏸️'}</strong></span>
              <span>الكمية: <strong className="text-purple-300 font-mono">{config.ticketQuantity}</strong></span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Webook Bot Engine v2.4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
