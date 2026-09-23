import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Check, Info, Lock, ExternalLink, RefreshCw, 
  Clock, ShieldCheck, Ticket, AlertCircle, ShoppingCart, 
  MapPin, Eye, Trophy, Music, Film, Map, CreditCard, BellRing, Copy, CheckCheck
} from 'lucide-react';
import { Seat, SeatingMapData, WebookEvent } from '../types/bot';
import { playReservationChime } from '../utils/audioAlert';
import { getWebookBookingUrl, getWebookEventUrl, WEBOOK_MY_BOOKINGS_URL } from '../utils/webookUrls';

interface InteractiveSeatingMapProps {
  event: WebookEvent;
  selectedSeats: Seat[];
  onToggleSeat: (seat: Seat) => void;
  onAutoPickBestSeats: (count: number, preferredTier: string) => void;
  ticketQuantity: number;
  preferredTier: string;
  onHoldSeatsOnWebook: () => void;
  isHolding: boolean;
  cartHoldInfo: {
    cartId: string;
    expiresAt: string;
    totalPrice: number;
    active: boolean;
  } | null;
  accountEmail: string;
}

export const InteractiveSeatingMap: React.FC<InteractiveSeatingMapProps> = ({
  event,
  selectedSeats,
  onToggleSeat,
  onAutoPickBestSeats,
  ticketQuantity,
  preferredTier,
  onHoldSeatsOnWebook,
  isHolding,
  cartHoldInfo,
  accountEmail,
}) => {
  const [activeTierFilter, setActiveTierFilter] = useState<string>('all');
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const directBookingUrl = getWebookBookingUrl(event);
  const officialEventUrl = getWebookEventUrl(event);

  const seatingMap = event.seatingMap;
  const isStadium = seatingMap.type === 'stadium';
  const isConcert = seatingMap.type === 'concert';

  // Chime and 10-minute timer when seats are held in cart
  useEffect(() => {
    if (cartHoldInfo?.active) {
      playReservationChime();
      setSecondsRemaining(600);
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cartHoldInfo?.active, cartHoldInfo?.cartId]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const filteredSeats = seatingMap.seats.filter((seat) => {
    if (activeTierFilter === 'all') return true;
    return seat.tierId === activeTierFilter;
  });

  return (
    <div className="bg-[#0b0e14] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header with Title & Legend */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ff007a]/20 text-[#ff007a] border border-[#ff007a]/30">
              المخطط التفاعلي الرسمي لـ Webook
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {seatingMap.totalSeats} مقعد إجمالي • {seatingMap.availableSeats} متاح الآن
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            {event.titleAr}
          </h3>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-pink-500" />
            <span>{event.locationAr}</span>
            <span className="text-slate-600">•</span>
            <span>{event.date}</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-400 shadow-sm" />
            <span className="text-slate-300">محدد للحجز ({selectedSeats.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#f59e0b] border border-amber-400" />
            <span className="text-slate-300">كبار الشخصيات VIP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#8b5cf6] border border-purple-400" />
            <span className="text-slate-300">مقاعد عادية Regular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-700 opacity-60" />
            <span className="text-slate-500">محجوز مسبقاً</span>
          </div>
        </div>
      </div>

      {/* Auto-Sniper Assistant Row */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              القناص الآلي للمقاعد (Auto-Seat Sniper)
            </h4>
            <p className="text-[11px] text-slate-400">
              يقوم البوت بقنص أفضل المقاعد المتتالية وحجزها باسمك دون الحاجة للبحث اليدوي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onAutoPickBestSeats(ticketQuantity || 2, preferredTier || 'vip')}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>قنص أفضل {ticketQuantity || 2} مقاعد ({preferredTier.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* Stage or Pitch Indicator Banner */}
      <div className="relative py-2 px-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-center shadow-inner">
        <div className="flex items-center justify-center gap-2">
          {isStadium ? (
            <Trophy className="w-4 h-4 text-emerald-400" />
          ) : isConcert ? (
            <Music className="w-4 h-4 text-amber-400" />
          ) : (
            <Film className="w-4 h-4 text-purple-400" />
          )}
          <span className="text-xs font-black tracking-wider text-slate-200 uppercase">
            {seatingMap.stageLabelAr}
          </span>
        </div>
      </div>

      {/* Seating Topology Matrix */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="min-w-[650px] p-6 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center gap-3">
          {seatingMap.sections.map((sec) => {
            const sectionSeats = seatingMap.seats.filter((s) => sec.rows.includes(s.row));

            return (
              <div key={sec.id} className="w-full space-y-2 border-b border-slate-900/60 pb-3 last:border-b-0">
                <div className="flex items-center justify-between text-[11px] px-2">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                    {sec.nameAr}
                  </span>
                  <span className="font-mono text-slate-500">
                    السعر: <strong className="text-white">{sec.price}</strong> ر.س • متبقي {sec.availableCount} مقعد
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  {sec.rows.map((row) => {
                    const rowSeats = sectionSeats.filter((s) => s.row === row);

                    return (
                      <div key={row} className="flex items-center gap-2">
                        <span className="w-8 text-[11px] font-mono text-slate-500 text-left font-bold">
                          {row}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {rowSeats.map((seat) => {
                            const isSelected = selectedSeats.some((s) => s.id === seat.id);
                            const isReserved = seat.status === 'reserved';
                            const isVip = seat.tierId === 'vip';

                            return (
                              <button
                                key={seat.id}
                                disabled={isReserved}
                                onClick={() => onToggleSeat(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                title={`${seat.label} - ${seat.tierNameAr} (${seat.price} ر.س) - ${isReserved ? 'محجوز' : 'متاح'}`}
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 scale-110 shadow-lg shadow-emerald-500/50 z-10'
                                    : isReserved
                                    ? 'bg-slate-900 text-slate-700 border border-slate-800/80 cursor-not-allowed opacity-50'
                                    : isVip
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 hover:scale-105'
                                    : 'bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600 hover:text-white hover:scale-105'
                                }`}
                              >
                                {seat.number}
                              </button>
                            );
                          })}
                        </div>

                        <span className="w-8 text-[11px] font-mono text-slate-500 text-right font-bold">
                          {row}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Seats Summary Bar & Universal Action Button */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-right">
          <span className="text-xs text-slate-400 block">المقاعد المحددة في هذا الحجز:</span>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
            {selectedSeats.length === 0 ? (
              <span className="text-xs text-amber-400 font-medium">
                لم يتم اختيار أي مقاعد بعد. انقر على المقاعد في المخطط أو اضغط زر القنص التلقائي.
              </span>
            ) : (
              selectedSeats.map((seat) => (
                <span
                  key={seat.id}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold"
                >
                  صف {seat.row} - مقعد {seat.number} ({seat.price} ر.س)
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left font-mono">
            <span className="text-[11px] text-slate-400 block">الإجمالي المطلوب:</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {selectedSeats.reduce((acc, s) => acc + s.price, 0)} <span className="text-xs text-purple-400">ر.س</span>
            </span>
          </div>

          <button
            onClick={onHoldSeatsOnWebook}
            disabled={selectedSeats.length === 0 || isHolding}
            className={`px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              selectedSeats.length > 0 && !isHolding
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/30 hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isHolding ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري قفل المقاعد في خوادم Webook...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>⚡ تنفيذ الحجز الآلي (قفل السلة والدفع فقط)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real Webook Cart Hold Notification / Direct Payment Portal */}
      {cartHoldInfo?.active && (
        <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 space-y-5 animate-in fade-in shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 shrink-0">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40 inline-flex items-center gap-1.5 mb-1">
                  <BellRing className="w-3.5 h-3.5 animate-bounce" />
                  <span>تم تنفيذ كل شيء من البوت بنجاح تام!</span>
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  المقاعد محجوزة ومقفلة باسمك في سلة Webook الرسمية الآن
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  معرف السلة: <code className="font-mono font-bold text-emerald-300">{cartHoldInfo.cartId}</code> • {accountEmail ? (
                    <>مرتبطة بحسابك: <span className="font-mono text-white font-bold">{accountEmail}</span></>
                  ) : (
                    <span className="text-amber-300">تم حجزها عبر الجلسة الحالية (أضف حسابك في تبويب الحسابات لمطابقة أسرع)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Glowing 10-Minute Countdown Clock */}
            <div className="flex items-center gap-2 bg-slate-950/90 px-4 py-2 rounded-2xl border border-emerald-500/60 text-emerald-300 text-sm font-mono font-black shadow-inner">
              <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>مهلة السلة: {formatCountdown(secondsRemaining)}</span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>أنت لا تحتاج لفتح المنصة إطلاقاً إلا الآن للدفع بالبطاقة البنكية فقط:</span>
            </div>
            <p className="text-slate-400 leading-relaxed mr-6">
              تم إتمام خطوات تسجيل الدخول، واختيار المقاعد، وإضافتها بالسلة تلقائياً لفعالية <strong className="text-emerald-300">{event.titleAr}</strong>. كل ما تبقى عليك هو فتح الرابط التالي لتجد مقاعدك بالسلة، وإدخال بيانات بطاقتك (مدى / فيزا / Apple Pay) والدفع بأمان تام.
            </p>
          </div>

          {/* Direct Checkout Pay & Quick Access Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                <span>وسائل الدفع المدعومة في Webook:</span>
                <span className="px-2 py-0.5 bg-slate-800 text-white rounded font-bold">mada</span>
                <span className="px-2 py-0.5 bg-slate-800 text-white rounded font-bold">Apple Pay</span>
                <span className="px-2 py-0.5 bg-slate-800 text-white rounded font-bold">Visa / MC</span>
              </div>

              {/* Copy Direct Link Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(directBookingUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">تم نسخ الرابط!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>نسخ رابط الحجز المباشر</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Primary Direct Booking Checkout (Opens /book of event without 404) */}
              <a
                href={directBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:col-span-2 py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <span>💳 الانتقال للدفع المباشر للفعالية في Webook</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              {/* Secondary: Official Event Page */}
              <a
                href={officialEventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 text-center"
              >
                <span>صفحة الفعالية الرسمية</span>
                <ExternalLink className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              </a>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span>رابط الحجز المباشر الموثق: <code className="font-mono text-emerald-400 text-[10px] break-all">{directBookingUrl}</code></span>
              <a
                href={WEBOOK_MY_BOOKINGS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline font-medium shrink-0 mr-2"
              >
                حجوزاتي في Webook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
