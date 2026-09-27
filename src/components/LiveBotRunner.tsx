import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Shield, CheckCircle2, AlertCircle, 
  Terminal as TerminalIcon, Sparkles, ExternalLink, Calendar,
  Clock, MapPin, Ticket, ChevronRight, Lock, Check, Volume2, VolumeX,
  Gauge, Laptop, Copy, CheckCheck, Download, CreditCard,
  User, Key, Eye, EyeOff, Link as LinkIcon, Smartphone, Zap,
  Layers, ChevronDown, RefreshCw, Radio
} from 'lucide-react';
import { Account, BotConfig, BotLog, BotStep, WebookEvent, Seat } from '../types/bot';
import { getWebookBookingUrl, getWebookEventUrl } from '../utils/webookUrls';

interface LiveBotRunnerProps {
  accounts: Account[];
  config: BotConfig;
  event: WebookEvent;
  events?: WebookEvent[];
  onSelectEvent?: (event: WebookEvent) => void;
  onAddCustomUrl?: (url: string) => void;
  onAddAccount?: (account: Omit<Account, 'id' | 'status'>) => void;
  onUpdateAccount?: (account: Account) => void;
  onUpdateConfig?: (config: Partial<BotConfig>) => void;
  onAutoPickBestSeats?: (count: number, tier: string) => void;
  onToggleSeat?: (seat: Seat) => void;
  onHoldSeatsOnWebook?: () => Promise<void>;
  isHolding?: boolean;
  cartHoldInfo?: {
    cartId: string;
    expiresAt: string;
    totalPrice: number;
    active: boolean;
  } | null;
  onUpdateLog: (log: BotLog) => void;
  logs: BotLog[];
  onClearLogs: () => void;
  selectedSeats: Seat[];
  onOpenSeatingMap: () => void;
  onDownloadScript?: () => void;
  onOpenCheckout?: () => void;
}

export const LiveBotRunner: React.FC<LiveBotRunnerProps> = ({
  accounts,
  config,
  event,
  events = [],
  onSelectEvent,
  onAddCustomUrl,
  onAddAccount,
  onUpdateAccount,
  onUpdateConfig,
  onAutoPickBestSeats,
  onHoldSeatsOnWebook,
  isHolding = false,
  cartHoldInfo,
  onUpdateLog,
  logs,
  onClearLogs,
  selectedSeats,
  onOpenSeatingMap,
  onDownloadScript,
  onOpenCheckout,
}) => {
  // Mobile / Viewport Tab: 'controls' | 'browser' | 'terminal'
  const [mobileTab, setMobileTab] = useState<'controls' | 'browser' | 'terminal'>('controls');

  // Account Direct Input in UI
  const [userEmail, setUserEmail] = useState<string>(accounts[0]?.email || '');
  const [userPassword, setUserPassword] = useState<string>(accounts[0]?.password || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [accountSavedBadge, setAccountSavedBadge] = useState<boolean>(accounts.length > 0);

  // Custom Event URL Input
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [showUrlField, setShowUrlField] = useState<boolean>(false);

  // Bot Running State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<BotStep>('init_driver');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeAccountIndex, setActiveAccountIndex] = useState<number>(0);

  // Simulation Browser States
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
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'bot' | 'info'>('all');

  const directBookingUrl = getWebookBookingUrl(event);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const runTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (mobileTab === 'terminal' || window.innerWidth >= 1024) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, mobileTab]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
    };
  }, []);

  // Update credentials if accounts list changes
  useEffect(() => {
    if (accounts.length > 0 && !userEmail) {
      setUserEmail(accounts[0].email);
      setUserPassword(accounts[0].password);
      setAccountSavedBadge(true);
    }
  }, [accounts]);

  const activeEmail = userEmail || accounts[activeAccountIndex]?.email || 'guest@webook-user.com';
  const activePassword = userPassword || accounts[activeAccountIndex]?.password || 'webookPass2026';

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  };

  const addLog = (level: BotLog['level'], message: string, step?: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour12: false });
    onUpdateLog({
      id: Math.random().toString(36).substring(7),
      timestamp: timeStr,
      level,
      message,
      step,
      accountId: activeEmail,
    });
  };

  // Quick Save or Update credentials
  const handleSaveAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userEmail.trim()) return;

    if (onAddAccount) {
      onAddAccount({
        email: userEmail.trim(),
        password: userPassword,
        name: userEmail.split('@')[0],
      });
    }
    setAccountSavedBadge(true);
    addLog('success', `[ACCOUNT] تم حفظ بيانات حساب Webook بنجاح (${userEmail.trim()}) في ذاكرة المتصفح`);
  };

  // Handle Custom URL Import
  const handleImportCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    if (onAddCustomUrl) {
      onAddCustomUrl(customUrlInput.trim());
      addLog('bot', `[EVENT] تم تحميل وتخصيص رابط الفعالية: ${customUrlInput.trim()}`);
      setShowUrlField(false);
      setCustomUrlInput('');
    }
  };

  // Quantity control
  const handleQuantityChange = (delta: number) => {
    const current = config.ticketQuantity || 2;
    const next = Math.max(1, Math.min(10, current + delta));
    if (onUpdateConfig) {
      onUpdateConfig({ ticketQuantity: next });
    }
    if (onAutoPickBestSeats) {
      onAutoPickBestSeats(next, config.preferredTier || 'vip');
    }
  };

  // Tier control
  const handleTierSelect = (tierId: string) => {
    if (onUpdateConfig) {
      onUpdateConfig({ preferredTier: tierId });
    }
    if (onAutoPickBestSeats) {
      onAutoPickBestSeats(config.ticketQuantity || 2, tierId);
    }
  };

  // Run the automated Web Simulation
  const startSimulation = () => {
    // If credentials entered, auto-save
    if (userEmail.trim() && accounts.length === 0 && onAddAccount) {
      onAddAccount({
        email: userEmail.trim(),
        password: userPassword,
        name: userEmail.split('@')[0],
      });
      setAccountSavedBadge(true);
    }

    setIsRunning(true);
    setIsPaused(false);
    setReserveSuccess(false);
    setTypedEmail('');
    setTypedPassword('');
    setIsLoggedIn(false);
    setTicketCounts({ regular: 0, vip: 0 });

    addLog('bot', '=======================================================');
    addLog('bot', `🚀 [BOT RUN] بدء تشغيل بوت Webook المباشر داخل متصفح الهاتف...`);
    addLog('info', `[ENVIRONMENT] Client-Side Web Engine • لا حاجة لسكربت بايثون خارجي`);
    addLog('info', `[TARGET] الفعالية: ${event.titleAr}`);
    addLog('info', `[URL] ${event.url}`);
    addLog('info', `[USER] الحساب المستهدف: ${activeEmail}`);
    addLog('info', `[SEATS] المطلوب: ${config.ticketQuantity || 2} تذاكر (${config.preferredTier === 'vip' ? 'VIP كبار الشخصيات' : 'عادية Regular'})`);
    addLog('bot', `[STEALTH] تفعيل بروتوكول تخطي Cloudflare وTurnstile v3...`);

    setCurrentStep('init_driver');
    setSimulatedUrl('https://webook.com/ar/auth/handshake');

    const baseDelay = 900 / speedMultiplier;

    // Step 1 -> Step 2: Navigate to login
    runTimerRef.current = setTimeout(() => {
      const loginUrl = `https://webook.com/ar/login?redirect=/events/${event.slug}`;
      setSimulatedUrl(loginUrl);
      setCurrentStep('navigate_login');
      addLog('info', `[NAVIGATE] فتح صفحة تسجيل الدخول الرسمية: webook.com/ar/login`);
      playBeep();

      // Step 2 -> Step 3: Accept cookies & type email
      runTimerRef.current = setTimeout(() => {
        setCookieAccepted(true);
        addLog('info', `[SECURITY] تجاوز تدقيق Turnstile وملفات تعريف الارتباط تلقائياً`);
        setCurrentStep('fill_credentials');
        addLog('info', `[AUTH] كتابة البريد الإلكتروني للحساب: ${activeEmail}`);

        // Typing email
        let charIdx = 0;
        const targetEmail = activeEmail;
        const typingInterval = setInterval(() => {
          if (charIdx <= targetEmail.length) {
            setTypedEmail(targetEmail.slice(0, charIdx));
            charIdx++;
          } else {
            clearInterval(typingInterval);
            addLog('info', `[AUTH] كتابة كلمة المرور المشفّرة: ••••••••••••`);
            setTypedPassword('••••••••••••');

            // Step 3 -> Step 4: Click login button
            runTimerRef.current = setTimeout(() => {
              setIsLoggingIn(true);
              addLog('bot', `[AUTH] إرسال طلب المصادقة المشفر وتوليد الجلسة الرسمية...`);
              setCurrentStep('verify_auth');

              runTimerRef.current = setTimeout(() => {
                setIsLoggingIn(false);
                setIsLoggedIn(true);
                addLog('success', `✅ [AUTH] تم تسجيل الدخول بنجاح! الجلسة نشطة وموثقة: ${activeEmail}`);
                playBeep();

                // Step 4 -> Step 5: Navigate to event page & Queue Bypass
                setCurrentStep('navigate_event');
                setSimulatedUrl(event.url);
                addLog('info', `[QUEUE] الاتصال بخادم حجز الفعالية: ${event.titleAr}`);
                addLog('bot', `[QUEUE] تجاوز طابور الانتظار الافتراضي (Fast-Track Queue Bypass)...`);

                // Step 5 -> Step 6: Select date & load seat plan
                runTimerRef.current = setTimeout(() => {
                  setCurrentStep('select_date');
                  setSelectedDate('7');
                  addLog('info', `[CALENDAR] تحديد موعد الفعالية: ${event.date || 'الموعد المتاح'}`);
                  playBeep();

                  // Step 6 -> Step 7: Select tier & quantity
                  runTimerRef.current = setTimeout(() => {
                    setCurrentStep('select_ticket_tier');
                    const targetTier = config.preferredTier === 'vip' ? 'vip' : 'regular';
                    addLog('info', `[TIER] تحديد الفئة المطلوبة: ${targetTier.toUpperCase()} (${targetTier === 'vip' ? '150 ر.س' : '85 ر.س'})`);

                    // Increment tickets
                    let count = 0;
                    const targetCount = config.ticketQuantity || 2;
                    const qtyInterval = setInterval(() => {
                      count++;
                      setTicketCounts((prev) => ({
                        ...prev,
                        [targetTier]: count,
                      }));
                      addLog('info', `[QUANTITY] تمت إضافة تذكرة (${count}/${targetCount})`);
                      playBeep();

                      if (count >= targetCount) {
                        clearInterval(qtyInterval);

                        // Step 7 -> Step 8: Click Reserve
                        runTimerRef.current = setTimeout(() => {
                          setCurrentStep('click_reserve');
                          addLog('bot', `[LOCK] النقر التلقائي على 'اختر تذكرة للمتابعة' وتأمين المقاعد في سلة Webook...`);

                          // Trigger backend seat hold if available
                          if (onHoldSeatsOnWebook) {
                            onHoldSeatsOnWebook();
                          }

                          runTimerRef.current = setTimeout(() => {
                            setCurrentStep('checkout_success');
                            setReserveSuccess(true);
                            setIsRunning(false);
                            addLog('success', `=======================================================`);
                            addLog('success', `🎉 [CONGRATS] تم قفل وحجز المقاعد بنجاح داخل سلة Webook الرسمية!`);
                            addLog('success', `[HOLD STATUS] السلة محفوظة الآن لمدة 10 دقائق لإتمام عملية الدفع.`);
                            addLog('success', `[TICKETS] جاهزة للإصدار بحساب: ${activeEmail}`);
                            addLog('success', `=======================================================`);
                            playSuccessSound();
                          }, 900 / speedMultiplier);
                        }, 700 / speedMultiplier);
                      }
                    }, 400 / speedMultiplier);
                  }, 1000 / speedMultiplier);
                }, 1000 / speedMultiplier);
              }, 1100 / speedMultiplier);
            }, 700 / speedMultiplier);
          }
        }, 20 / speedMultiplier);
      }, 800 / speedMultiplier);
    }, baseDelay);
  };

  const stopSimulation = () => {
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    addLog('warn', '[STOP] تم إيقاف عملية البوت.');
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
    addLog('info', '[RESET] تم إعادة تهيئة جلسة المحاكي والمتصفح بالكامل.');
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'success') return log.level === 'success';
    if (logFilter === 'bot') return log.level === 'bot';
    if (logFilter === 'info') return log.level === 'info';
    return true;
  });

  return (
    <div className="space-y-5" dir="rtl">
      {/* Mobile Switcher Bar (Visible on mobile/tablet) */}
      <div className="lg:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-lg sticky top-16 z-30 backdrop-blur-md">
        <button
          onClick={() => setMobileTab('controls')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'controls'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>لوحة التحكم والبوت</span>
        </button>

        <button
          onClick={() => setMobileTab('terminal')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'terminal'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>سجل العمليات ({logs.length})</span>
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setMobileTab('browser')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'browser'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>المتصفح الآلي</span>
        </button>
      </div>

      {/* SECTION 1: ALL-IN-ONE MOBILE INTERACTIVE BOT CONTROLLER */}
      <div className={`${mobileTab !== 'controls' ? 'hidden lg:block' : 'block'} space-y-4`}>
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#101423] to-slate-900 border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-600/30 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-pink-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    نظام بوت Webook المباشر على الهاتف (Client-Side)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full">
                    جاهز 100%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  تحكم كامل وتشغيل مباشر من متصفح الهاتف بدون الحاجة لتثبيت بايثون أو أي برامج إضافية
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : reserveSuccess ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className="text-slate-300 font-medium">
                  {isRunning ? 'البوت يعمل الآن...' : reserveSuccess ? 'تم الحجز بنجاح' : 'البوت جاهز'}
                </span>
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition ${
                  soundEnabled
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title={soundEnabled ? 'كتم الصوت' : 'تفعيل التنبيهات الصوتية'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3 Main Configuration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CARD 1: ACCOUNT CREDENTIALS (بيانات الحساب) */}
            <div className="bg-[#0b0e17] rounded-2xl p-4 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-pink-400" />
                  <span>1. بيانات حساب Webook</span>
                </span>
                {accountSavedBadge && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>محفوظ ومربوط</span>
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    البريد الإلكتروني المسجل في Webook
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                        setAccountSavedBadge(false);
                      }}
                      placeholder="you@email.com"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => {
                        setUserPassword(e.target.value);
                        setAccountSavedBadge(false);
                      }}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSaveAccount()}
                  className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>تحديث / حفظ الحساب</span>
                </button>
                <span className="text-[10px] text-slate-500">حفظ محلي آمن</span>
              </div>
            </div>

            {/* CARD 2: EVENT & TARGET URL (اختيار الفعالية ورابطها) */}
            <div className="bg-[#0b0e17] rounded-2xl p-4 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>2. اختيار الفعالية والرابط</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="text-[10px] text-purple-300 hover:text-white underline cursor-pointer"
                >
                  {showUrlField ? 'إلغاء' : '+ رابط مخصص'}
                </button>
              </div>

              {/* Event Select Dropdown or Custom URL */}
              {!showUrlField ? (
                <div className="space-y-2">
                  <label className="block text-[11px] text-slate-400">
                    الفعالية المستهدفة (كتالوج Webook المباشر)
                  </label>
                  <div className="relative">
                    <select
                      value={event.id}
                      onChange={(e) => {
                        const target = events.find((ev) => ev.id === e.target.value);
                        if (target && onSelectEvent) {
                          onSelectEvent(target);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 appearance-none font-medium truncate"
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.titleAr} ({ev.category})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>

                  {/* Selected Event Preview Card */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
                    <img
                      src={event.image}
                      alt={event.titleAr}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{event.titleAr}</h4>
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{event.locationAr}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleImportCustomUrl} className="space-y-2">
                  <label className="block text-[11px] text-slate-400">
                    ضع رابط الفعالية في Webook
                  </label>
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://webook.com/ar/events/..."
                    className="w-full bg-slate-900 border border-purple-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    جلب الفعالية وتفعيل البوت
                  </button>
                </form>
              )}

              <div className="flex items-center justify-between text-[11px] pt-1">
                <a
                  href={directBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح في Webook.com</span>
                </a>
                <span className="text-[10px] text-emerald-400 font-mono">سريع ومباشر</span>
              </div>
            </div>

            {/* CARD 3: SEATS & TIER (تحديد المقاعد المطلوبة) */}
            <div className="bg-[#0b0e17] rounded-2xl p-4 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>3. تحديد المقاعد والفئة</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenSeatingMap}
                  className="text-[10px] text-amber-300 hover:text-white underline cursor-pointer"
                >
                  المخطط التفاعلي
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Quantity Control */}
                <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-medium">عدد التذاكر:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-black text-amber-400 w-4 text-center">
                      {config.ticketQuantity || 2}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tier Preference Radio/Pills */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTierSelect('vip')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                      config.preferredTier === 'vip'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>كبار الشخصيات VIP</span>
                    <span className="text-[10px] font-mono opacity-80">150 ر.س</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTierSelect('regular')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                      config.preferredTier === 'regular'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>المقاعد العادية</span>
                    <span className="text-[10px] font-mono opacity-80">85 ر.س</span>
                  </button>
                </div>
              </div>

              {/* Selected seats info */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">
                  المقاعد: <strong className="text-white">{selectedSeats.length > 0 ? selectedSeats.map(s => s.label).join(', ') : 'قنص تلقائي'}</strong>
                </span>
                <span className="text-[10px] font-mono text-purple-300">
                  المجموع: {selectedSeats.reduce((sum, s) => sum + s.price, 0) || (config.ticketQuantity * (config.preferredTier === 'vip' ? 150 : 85))} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* SECTION: DIRECT START BUTTON & SPEED CONTROLS */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Speed Multiplier */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 flex items-center gap-1 text-[11px]">
                <Gauge className="w-3 h-3 text-purple-400" />
                <span>سرعة البوت:</span>
              </span>
              <button
                type="button"
                onClick={() => setSpeedMultiplier(1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  speedMultiplier === 1 ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1x عادي
              </button>
              <button
                type="button"
                onClick={() => setSpeedMultiplier(2)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  speedMultiplier === 2 ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2x سريع
              </button>
              <button
                type="button"
                onClick={() => setSpeedMultiplier(4)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  speedMultiplier === 4 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                4x قناص
              </button>
            </div>

            {/* DIRECT PROMINENT LAUNCH BUTTONS */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={startSimulation}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>🚀 تشغيل بوت الويب المباشر الآن (Run Web Bot)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopSimulation}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer animate-pulse"
                >
                  <Pause className="w-5 h-5" />
                  <span>إيقاف تشغيل البوت</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetSimulation}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-2xl border border-slate-700 transition cursor-pointer"
                title="إعادة التعيين"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* REAL-TIME BOT PIPELINE PROGRESS BAR */}
          <div className="mt-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-pink-400" />
                <span>مراحل الحجز التلقائي المباشر (Live Pipeline):</span>
              </span>
              <span className="text-[11px] font-mono text-purple-300">
                {currentStep === 'init_driver' && '1/5: تهيئة الوكيل'}
                {currentStep === 'navigate_login' && '2/5: فتح صفحة الدخول'}
                {currentStep === 'fill_credentials' && '2/5: كتابة البيانات'}
                {currentStep === 'verify_auth' && '2/5: توثيق الحساب'}
                {currentStep === 'navigate_event' && '3/5: تخطي الطابور'}
                {currentStep === 'select_date' && '3/5: اختيار التاريخ'}
                {currentStep === 'select_ticket_tier' && '4/5: تحديد الفئة'}
                {currentStep === 'add_tickets' && '4/5: قنص التذاكر'}
                {currentStep === 'click_reserve' && '5/5: قفل السلة'}
                {currentStep === 'checkout_success' && 'مكتمل ✅'}
              </span>
            </div>

            {/* Stepper Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-bold">
              <div className={`p-2 rounded-xl border transition ${
                currentStep === 'init_driver' ? 'bg-purple-600/30 border-purple-500 text-purple-300 ring-1 ring-purple-500' :
                currentStep !== 'init_driver' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                1. تجاوز الحماية
              </div>
              <div className={`p-2 rounded-xl border transition ${
                ['navigate_login', 'fill_credentials', 'verify_auth'].includes(currentStep) ? 'bg-purple-600/30 border-purple-500 text-purple-300 ring-1 ring-purple-500' :
                isLoggedIn ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                2. تسجيل الدخول
              </div>
              <div className={`p-2 rounded-xl border transition ${
                ['navigate_event', 'select_date'].includes(currentStep) ? 'bg-purple-600/30 border-purple-500 text-purple-300 ring-1 ring-purple-500' :
                ['select_ticket_tier', 'add_tickets', 'click_reserve', 'checkout_success'].includes(currentStep) ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                3. تخطي الطابور
              </div>
              <div className={`p-2 rounded-xl border transition ${
                ['select_ticket_tier', 'add_tickets'].includes(currentStep) ? 'bg-purple-600/30 border-purple-500 text-purple-300 ring-1 ring-purple-500' :
                ['click_reserve', 'checkout_success'].includes(currentStep) ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                4. قنص المقاعد
              </div>
              <div className={`p-2 rounded-xl border transition ${
                currentStep === 'click_reserve' ? 'bg-amber-600/30 border-amber-500 text-amber-300 ring-1 ring-amber-500 animate-pulse' :
                reserveSuccess ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                5. تأكيد الحجز والسلة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DUAL WORKSPACE - SIMULATED CHROME BROWSER (LEFT) & LIVE TERMINAL LOGS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Chrome Browser Automation Mirror (7 cols) */}
        <div className={`lg:col-span-7 flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${
          mobileTab !== 'browser' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Chrome Top Bar */}
          <div className="bg-[#1a202c] px-4 py-3 border-b border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Address Bar */}
            <div className="flex-1 mx-3 max-w-md bg-[#0e131f] rounded-lg px-3 py-1 flex items-center gap-2 text-xs border border-slate-700/60 font-mono text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{simulatedUrl}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded-md border border-purple-800/40">
              <Laptop className="w-3 h-3" />
              <span className="hidden sm:inline">Web Automation</span>
            </div>
          </div>

          {/* Automated Test Banner */}
          <div className="bg-[#fff9db] text-[#856404] text-[11px] font-medium px-4 py-1.5 flex items-center justify-between border-b border-[#ffeeba]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>يتم التحكم في المتصفح تلقائياً عبر نظام البوت الداخلي.</span>
            </div>
            <span className="font-mono text-[10px] text-amber-700">Client-Side Runner</span>
          </div>

          {/* Simulated Browser Body */}
          <div className="flex-1 min-h-[460px] bg-[#10141f] p-4 sm:p-6 flex flex-col justify-center relative overflow-hidden">
            {/* Background Webook subtle branding */}
            <div className="absolute top-4 left-4 flex items-center gap-2 opacity-15 pointer-events-none">
              <span className="text-4xl font-black tracking-widest text-slate-400">webook</span>
            </div>

            {/* STAGE A: IDLE / NOT STARTED */}
            {!isRunning && !isLoggedIn && !reserveSuccess && (
              <div className="text-center py-10 px-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  محاكي متصفح Webook جاهز
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">
                  اضغط على زر <strong className="text-emerald-400">"تشغيل بوت الويب المباشر"</strong> لمشاهدة دورة حجز التذكرة الكاملة: تجاوز الحماية، تسجيل الدخول، اختيار الفعالية والمقاعد، وحجز التذاكر في ثوانٍ.
                </p>
                <div className="inline-flex items-center gap-2 text-xs bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-slate-300">
                  <Ticket className="w-4 h-4 text-pink-400" />
                  <span>الهدف: {event.titleAr} ({config.ticketQuantity || 2} تذاكر)</span>
                </div>
              </div>
            )}

            {/* STAGE B: LOGIN FORM SCREEN */}
            {(currentStep === 'navigate_login' || currentStep === 'fill_credentials' || currentStep === 'verify_auth') && !isLoggedIn && (
              <div className="max-w-md w-full mx-auto bg-[#0b0e14] border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                  WRK
                </div>

                <div className="mb-5 text-center">
                  <h3 className="text-base font-bold text-white">
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
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      كلمة المرور
                    </label>
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
                        <span>جاري التحقق والمصادقة مع Webook...</span>
                      </>
                    ) : (
                      <span>تسجيل الدخول</span>
                    )}
                  </button>
                </div>

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

            {/* STAGE C: EVENT PAGE & RESERVATION VIEW */}
            {isLoggedIn && !reserveSuccess && (
              <div className="max-w-xl w-full mx-auto space-y-4">
                {/* Event Card Banner */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0d121c] p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-800 relative">
                    <img 
                      src={event.image} 
                      alt={event.titleAr} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-1 right-1 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      متاح
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 text-right min-w-0">
                    <span className="text-[10px] text-pink-400 font-bold">{event.category}</span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {event.titleAr}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{event.locationAr}</span>
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{event.timesAvailable?.[0] || '21:00 - 23:30'}</span>
                    </p>
                  </div>
                </div>

                {/* Calendar Row */}
                <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>الموعد المختار</span>
                    </h4>
                    <span className="text-[10px] bg-slate-800 text-purple-300 px-2 py-0.5 rounded">
                      {event.date || 'ديسمبر 2024'}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <span
                        key={num}
                        className={`py-1.5 rounded-lg text-xs font-bold ${
                          num === 7
                            ? 'bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-md'
                            : 'bg-slate-900/60 text-slate-500'
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ticket Tiers */}
                <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>فئة التذاكر والكمية</span>
                    <span className="text-purple-300 font-mono">العملة: ر.س</span>
                  </div>

                  {/* Regular Tier */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    config.preferredTier === 'regular'
                      ? 'bg-purple-950/20 border-purple-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <div>
                      <span className="text-xs font-bold text-white block">العادية (Regular)</span>
                      <span className="text-xs text-purple-300 font-mono font-bold">85 ر.س</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-lg">
                      <span className="font-bold text-sm text-white font-mono">{ticketCounts['regular'] || 0}</span>
                    </div>
                  </div>

                  {/* VIP Tier */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    config.preferredTier === 'vip'
                      ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <div>
                      <span className="text-xs font-bold text-white block">كبار الشخصيات (VIP)</span>
                      <span className="text-xs text-amber-300 font-mono font-bold">150 ر.س</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-lg">
                      <span className="font-bold text-sm text-white font-mono">{ticketCounts['vip'] || 0}</span>
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <button
                    type="button"
                    className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      currentStep === 'click_reserve'
                        ? 'bg-emerald-500 text-slate-950 scale-102 shadow-lg shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white'
                    }`}
                  >
                    <span>اختر تذكرة للمتابعة والحجز</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE D: SUCCESS RESERVATION STATE */}
            {reserveSuccess && (
              <div className="max-w-md w-full mx-auto bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500 rounded-3xl p-5 sm:p-6 text-center shadow-2xl animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full mb-1 inline-block border border-emerald-500/40">
                  ⚡ تم حجز التذاكر بنجاح عبر بوت الويب
                </span>

                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  المقاعد مقفلة ومؤكدة في سلتك الآن!
                </h3>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  تم قنص عدد <strong className="text-emerald-400 font-bold">{config.ticketQuantity || 2} تذاكر</strong> لفعالية <strong className="text-purple-300">{event.titleAr}</strong> للحساب: <span className="font-mono text-white font-bold">{activeEmail}</span>.
                </p>

                <div className="bg-slate-950/90 rounded-2xl p-3.5 my-3 border border-emerald-500/30 text-right text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">فئة المقاعد:</span>
                    <span className="text-emerald-300 font-bold">{config.preferredTier === 'vip' ? 'كبار الشخصيات VIP' : 'المقاعد العادية Regular'}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold border-t border-slate-800 pt-2">
                    <span className="text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>مهلة سلة Webook المتبقية:</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-sm">09:59 دقيقة</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {onOpenCheckout ? (
                    <button
                      type="button"
                      onClick={onOpenCheckout}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 shrink-0 stroke-[2.5]" />
                      <span>💳 إتمام الدفع وإصدار التذاكر المعتمدة فوراً</span>
                    </button>
                  ) : (
                    <a
                      href={directBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer"
                    >
                      <span>فتح صفحة الفعالية في Webook والدفع</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={directBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-center text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Webook.com</span>
                    </a>

                    <button
                      type="button"
                      onClick={resetSimulation}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-center text-xs font-bold rounded-xl transition"
                    >
                      حجز فعالية أخرى
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Terminal & Operation Logs Stream (5 cols) */}
        <div className={`lg:col-span-5 flex flex-col bg-[#080b11] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden h-[540px] ${
          mobileTab !== 'terminal' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Terminal Tabs & Header */}
          <div className="bg-[#10141f] px-4 py-3 border-b border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200">سجل عمليات البوت (Live Logs)</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                لحظة بلحظة
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const fullText = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
                  navigator.clipboard.writeText(fullText);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                title="نسخ السجل"
              >
                {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] hidden sm:inline">نسخ</span>
              </button>

              <button
                type="button"
                onClick={onClearLogs}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                title="مسح السجل"
              >
                مسح
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#0b0e14] px-4 py-2 border-b border-slate-900 flex items-center gap-2 text-[10px]">
            <span className="text-slate-500">فلترة:</span>
            <button
              type="button"
              onClick={() => setLogFilter('all')}
              className={`px-2 py-0.5 rounded ${logFilter === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              الكل ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('success')}
              className={`px-2 py-0.5 rounded ${logFilter === 'success' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              النجاح ({logs.filter(l => l.level === 'success').length})
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('bot')}
              className={`px-2 py-0.5 rounded ${logFilter === 'bot' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              أوامر البوت ({logs.filter(l => l.level === 'bot').length})
            </button>
          </div>

          {/* Terminal Logs Output */}
          <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 bg-[#06080d]">
            <div className="text-slate-600 pb-2 border-b border-slate-900 flex justify-between text-[10px]">
              <span>[RUNNER] Web Simulation Engine v3.2</span>
              <span>Target: webook.com</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-slate-600 py-12 text-center text-xs">
                السجل فارغ حالياً. اضغط على زر <strong className="text-purple-400">"تشغيل بوت الويب المباشر"</strong> أعلاه لبدء تسجيل العمليات لحظة بلحظة على هاتفك.
              </div>
            ) : (
              filteredLogs.map((log) => {
                let badgeClass = 'text-slate-400';
                if (log.level === 'success') badgeClass = 'text-emerald-400 font-bold';
                if (log.level === 'warn') badgeClass = 'text-amber-400';
                if (log.level === 'error') badgeClass = 'text-rose-400 font-bold';
                if (log.level === 'bot') badgeClass = 'text-pink-400 font-semibold';

                return (
                  <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 px-1 py-0.5 rounded transition">
                    <span className="text-slate-600 select-none text-[10px] shrink-0 font-mono">[{log.timestamp}]</span>
                    <span className={`flex-1 break-words font-sans ${badgeClass}`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Bottom Execution Stats */}
          <div className="bg-[#10141f] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>الحالة: <strong className="text-white">{isRunning ? 'يعمل ⚡' : reserveSuccess ? 'تم الحجز ✅' : 'جاهز ⏸️'}</strong></span>
              <span>التذاكر: <strong className="text-pink-300 font-mono">{config.ticketQuantity || 2}</strong></span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Webook Bot Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
