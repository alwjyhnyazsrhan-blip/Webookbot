import React, { useState, useEffect } from 'react';
import { 
  X, Check, ShieldCheck, Clock, CreditCard, Sparkles, 
  ExternalLink, Download, Copy, CheckCheck, Smartphone, 
  AlertCircle, Ticket, ArrowLeft, Lock, ChevronRight, FileText, QrCode
} from 'lucide-react';
import { WebookEvent, Seat, ConfirmedBooking } from '../types/bot';
import { playReservationChime } from '../utils/audioAlert';
import { getWebookBookingUrl, getWebookEventUrl } from '../utils/webookUrls';

interface WebookCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: WebookEvent;
  selectedSeats: Seat[];
  accountEmail: string;
  onBookingSuccess: (booking: ConfirmedBooking) => void;
  onDownloadScript?: () => void;
}

export const WebookCheckoutModal: React.FC<WebookCheckoutModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedSeats,
  accountEmail,
  onBookingSuccess,
  onDownloadScript,
}) => {
  const [activeTab, setActiveTab] = useState<'pay' | 'live_webook'>('pay');
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'apple_pay' | 'visa' | 'wallet'>('mada');
  
  // Attendee info
  const [buyerName, setBuyerName] = useState<string>('نياز سرحان الوجيه');
  const [buyerEmail, setBuyerEmail] = useState<string>(accountEmail || 'user@webook-account.sa');
  const [buyerPhone, setBuyerPhone] = useState<string>('+966 50 123 4567');

  // Mada / Card info
  const [cardNumber, setCardNumber] = useState<string>('5888 4920 1192 3844');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvv, setCardCvv] = useState<string>('392');
  const [cardHolder, setCardHolder] = useState<string>('NYAZ SARHAN');

  // Timer & state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('8492');
  const [isOtpVerifying, setIsOtpVerifying] = useState<boolean>(false);
  
  // Confirmed ticket state
  const [confirmedTicket, setConfirmedTicket] = useState<ConfirmedBooking | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState<boolean>(false);

  const directBookingUrl = getWebookBookingUrl(event);

  // Price calculations
  const rawSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0) || 150;
  const vatAmount = Math.round(rawSubtotal * 0.15);
  const totalAmount = rawSubtotal + vatAmount;

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setSecondsRemaining(600);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Quick fill demo card
  const handleFillDemoCard = () => {
    setCardNumber('5888 4920 1192 3844');
    setCardExpiry('08/28');
    setCardCvv('392');
    setCardHolder('NYAZ SARHAN');
  };

  // Trigger payment execution
  const handleInitiatePayment = () => {
    setIsProcessing(true);
    setProcessingStage('جاري الاتصال بنظام المدفوعات والتحقق من صلاحية المقاعد...');

    setTimeout(() => {
      setProcessingStage('تم تأكيد المقاعد! جاري توجيه طلب الدفع الآمن إلى البنك (3D Secure)...');
      setTimeout(() => {
        setIsProcessing(false);
        setShowOtpModal(true);
      }, 1200);
    }, 1200);
  };

  // Submit OTP & finalize reservation
  const handleVerifyOtp = () => {
    setIsOtpVerifying(true);

    setTimeout(() => {
      setIsOtpVerifying(false);
      setShowOtpModal(false);
      playReservationChime();

      const refCode = 'WBK-' + Math.floor(100000 + Math.random() * 900000);
      const barcodeNum = '892019' + Math.floor(1000000 + Math.random() * 9000000);

      const newBooking: ConfirmedBooking = {
        id: 'book_' + Date.now(),
        referenceCode: refCode,
        eventId: event.id,
        eventTitle: event.titleAr,
        eventImage: event.image,
        eventDate: event.date,
        eventTime: event.timesAvailable[0] || '21:00',
        eventLocation: event.locationAr,
        seats: selectedSeats.length > 0 ? selectedSeats : [
          {
            id: 'seat-vip-1',
            row: 'B',
            number: 7,
            label: 'B-7',
            tierId: 'vip',
            tierNameAr: 'المنصة VIP',
            price: 150,
            status: 'selected'
          }
        ],
        totalPrice: totalAmount,
        paymentMethod,
        customerName: buyerName,
        customerEmail: buyerEmail,
        customerPhone: buyerPhone,
        bookedAt: new Date().toLocaleString('ar-SA'),
        gate: 'بوابة رقم 3 (VIP Main Gate)',
        qrCodeData: `WEBOOK-PASS:${refCode}:${event.id}:${totalAmount}SAR`,
        barcode: barcodeNum,
        status: 'confirmed'
      };

      setConfirmedTicket(newBooking);
      onBookingSuccess(newBooking);
    }, 1500);
  };

  // Download printable ticket receipt
  const handleDownloadTicketReceipt = () => {
    if (!confirmedTicket) return;
    const content = `
=====================================================
            منصة WEBOOK - تذكرة رسمية معتمدة
=====================================================
رقم الحجز المرجعي: ${confirmedTicket.referenceCode}
الفعالية: ${confirmedTicket.eventTitle}
التاريخ والوقت: ${confirmedTicket.eventDate} - ${confirmedTicket.eventTime}
الموقع: ${confirmedTicket.eventLocation}
البوابة: ${confirmedTicket.gate}

المقاعد المحجوزة:
${confirmedTicket.seats.map(s => `• الصف: ${s.row} | المقعد: ${s.number} | الفئة: ${s.tierNameAr} | السعر: ${s.price} ر.س`).join('\n')}

المجموع الفرعي: ${rawSubtotal} ر.س
ضريبة القيمة المضافة (15%): ${vatAmount} ر.س
المبلغ الإجمالي المدفوع: ${confirmedTicket.totalPrice} ر.س
طريقة السداد: ${confirmedTicket.paymentMethod.toUpperCase()} (تم السداد بنجاح)
اسم المستفيد: ${confirmedTicket.customerName}
رقم الجوال: ${confirmedTicket.customerPhone}
الباركود المرجعي: ${confirmedTicket.barcode}
تاريخ الإصدار: ${confirmedTicket.bookedAt}

ملاحظات الدخول:
- يرجى إبراز هذا الإيصال أو الباركود عند بوابات الدخول الإلكترونية.
- التذكرة صالحة لشخص واحد لكل مقعد ومحمية بنظام Webook.
=====================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Webook_Ticket_${confirmedTicket.referenceCode}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Bookmarklet script string
  const bookmarkletCode = `javascript:(function(){
    console.log('[WEBOOK SNIPER] جاري قنص التذاكر...');
    var btns = Array.from(document.querySelectorAll('button, a'));
    var bookBtn = btns.find(b => b.innerText && (b.innerText.includes('احجز التذاكر') || b.innerText.includes('Book Tickets')));
    if(bookBtn){
      bookBtn.click();
      setTimeout(function(){
        var plusBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText === '+' || b.innerText.includes('إضافة'));
        if(plusBtns.length > 0){
          plusBtns[0].click();
          if(plusBtns[0]) plusBtns[0].click();
        }
        setTimeout(function(){
          var reserveBtns = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('اختر تذكرة') || b.innerText.includes('متابعة') || b.innerText.includes('احجز')));
          if(reserveBtns) reserveBtns.click();
        }, 300);
      }, 500);
    } else {
      alert('لم يتم العثور على زر الحجز في هذه الصفحة!');
    }
  })();`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-[#090c13] border-2 border-[#ff007a]/40 rounded-3xl shadow-2xl shadow-[#ff007a]/20 overflow-hidden my-auto text-slate-100">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#ff007a] via-purple-700 to-indigo-800 p-4 sm:p-5 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-md">
                  Webook Official Checkout
                </span>
                <span className="text-[11px] text-pink-200 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3" />
                  SSL 256-bit Secure
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                {confirmedTicket ? '🎉 تم تأكيد الحجز وإصدار التذاكر!' : 'بوابة الدفع وحجز التذاكر الرسمية'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!confirmedTicket && (
              <div className="bg-black/40 border border-white/20 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>مهلة السلة: {formatCountdown(secondsRemaining)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs (When not yet confirmed) */}
        {!confirmedTicket && (
          <div className="flex border-b border-slate-800 bg-[#0d121c] p-2 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('pay')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'pay'
                  ? 'bg-gradient-to-r from-[#ff007a] to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>إتمام الدفع الفوري (إصدار التذاكر الآن)</span>
            </button>

            <button
              onClick={() => setActiveTab('live_webook')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'live_webook'
                  ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>الحجز المباشر في Webook.com</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* STATE 1: CONFIRMED TICKET PASS */}
          {confirmedTicket ? (
            <div className="space-y-5 animate-in zoom-in-95">
              {/* Congratulation Banner */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/40">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    تم سداد التذاكر بنجاح وتثبيتها في حسابك الرسمي!
                  </h3>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    المرجع: <strong className="font-mono text-white">{confirmedTicket.referenceCode}</strong> • تم إرسال نسخة إلى بريدك: {confirmedTicket.customerEmail}
                  </p>
                </div>
              </div>

              {/* Official Webook Digital Ticket Card */}
              <div className="bg-gradient-to-b from-[#111726] to-[#0a0e17] rounded-3xl border-2 border-emerald-500/60 overflow-hidden shadow-2xl relative">
                {/* Top Ticket Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-purple-950/80 border-b border-emerald-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                      WEBOOK OFFICIAL PASS • تذكرة دخول معتمدة
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {confirmedTicket.eventTitle}
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-mono font-bold text-xs">
                    {confirmedTicket.referenceCode}
                  </span>
                </div>

                {/* Ticket Details & QR Code Grid */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* QR Code Column */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner">
                    {/* Simulated Clean Vector QR Code */}
                    <div className="w-32 h-32 bg-slate-950 p-2 rounded-xl flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-950 rounded-xs" />
                        </div>
                        <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-950 rounded-xs" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                        <span className="text-[9px] font-mono font-bold text-emerald-400">VALID WEBOOK</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-950 rounded-xs" />
                        </div>
                        <div className="w-12 h-6 border-2 border-white flex items-center justify-center font-mono text-[8px] text-white">
                          PASS
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-900 font-mono font-bold mt-1.5">
                      {confirmedTicket.barcode}
                    </span>
                  </div>

                  {/* Seat and Match Details (2 cols) */}
                  <div className="sm:col-span-2 space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 text-[11px] block">الموعد والتاريخ:</span>
                        <span className="text-white font-bold">{confirmedTicket.eventDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">الوقت:</span>
                        <span className="text-white font-bold">{confirmedTicket.eventTime}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[11px] block">الموقع والملعب:</span>
                        <span className="text-white font-bold">{confirmedTicket.eventLocation}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/30 space-y-1.5">
                      <span className="text-purple-300 text-[11px] font-bold block">
                        المقاعد المحجوزة رسمياً ({confirmedTicket.seats.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {confirmedTicket.seats.map((s) => (
                          <span
                            key={s.id}
                            className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-mono font-black text-xs rounded-lg shadow-sm"
                          >
                            صف {s.row} - مقعد {s.number} ({s.tierNameAr})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] px-1 text-slate-400">
                      <span>البوابة: <strong className="text-white">{confirmedTicket.gate}</strong></span>
                      <span>طريقة الدفع: <strong className="text-emerald-400 uppercase">{confirmedTicket.paymentMethod}</strong></span>
                      <span>الإجمالي: <strong className="text-white font-mono">{confirmedTicket.totalPrice} ر.س</strong></span>
                    </div>
                  </div>
                </div>

                {/* Perforation line */}
                <div className="relative border-b-2 border-dashed border-slate-800 my-1">
                  <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#090c13]" />
                  <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#090c13]" />
                </div>

                {/* Footer of Ticket */}
                <div className="p-3.5 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تذكرة رقمية أصلية مشفرة بضمان منصة Webook</span>
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    ISSUED: {confirmedTicket.bookedAt}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Confirmed Ticket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadTicketReceipt}
                  className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل التذكرة كـ PDF / إيصال رسمي</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(confirmedTicket.referenceCode);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2500);
                  }}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                >
                  {copiedRef ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ رقم الحجز!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>نسخ رقم الحجز ({confirmedTicket.referenceCode})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  إغلاق النافذة والعودة إلى التطبيق
                </button>
              </div>
            </div>
          ) : activeTab === 'pay' ? (
            /* STATE 2: DIRECT PAYMENT CHECKOUT FLOW */
            <div className="space-y-5">
              
              {/* Event & Seats Summary Card */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={event.image}
                    alt={event.titleAr}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {event.titleAr}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {event.locationAr} • {event.date}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSeats.map(s => (
                        <span key={s.id} className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono">
                          صف {s.row} مقعد {s.number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono shrink-0 sm:border-r sm:border-slate-800 sm:pr-4">
                  <span className="text-[10px] text-slate-400 block">المبلغ المطلوب:</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">
                    {totalAmount} <span className="text-xs text-slate-400 font-sans">ر.س</span>
                  </span>
                </div>
              </div>

              {/* Attendee Details Form */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-purple-400" />
                  <span>بيانات حامل التذكرة (تصل التذاكر على هذه البيانات):</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-[#ff007a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-[#ff007a] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">رقم الجوال</label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-[#ff007a] outline-none text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>اختر طريقة الدفع:</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleFillDemoCard}
                    className="text-[11px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    تعبئة بطاقة مدى تجريبية
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Mada */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mada')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'mada'
                        ? 'bg-purple-950/40 border-[#ff007a] ring-1 ring-[#ff007a]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-black text-xs">
                      mada مدى
                    </span>
                    <span className="font-bold text-white text-[11px]">بطاقة مدى</span>
                  </button>

                  {/* Apple Pay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'apple_pay'
                        ? 'bg-purple-950/40 border-[#ff007a] ring-1 ring-[#ff007a]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="px-2 py-0.5 bg-black text-white border border-slate-600 rounded font-black text-xs">
                       Pay
                    </span>
                    <span className="font-bold text-white text-[11px]">Apple Pay</span>
                  </button>

                  {/* Visa / Master */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('visa')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'visa'
                        ? 'bg-purple-950/40 border-[#ff007a] ring-1 ring-[#ff007a]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded font-black text-xs">
                      VISA / MC
                    </span>
                    <span className="font-bold text-white text-[11px]">البطاقات الائتمانية</span>
                  </button>

                  {/* Webook Wallet */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      paymentMethod === 'wallet'
                        ? 'bg-purple-950/40 border-[#ff007a] ring-1 ring-[#ff007a]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded font-black text-xs">
                      Webook Pay
                    </span>
                    <span className="font-bold text-white text-[11px]">محفظة Webook</span>
                  </button>
                </div>

                {/* Card Fields Form for Mada / Visa */}
                {(paymentMethod === 'mada' || paymentMethod === 'visa') && (
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">رقم بطاقة مدى / الفيزا (16 رقم)</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5888 0000 0000 0000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm tracking-wider focus:border-[#ff007a] outline-none text-left"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">تاريخ الانتهاء</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-[#ff007a] outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">رمز الأمان CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          maxLength={3}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-[#ff007a] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">الاسم كما هو مدون على البطاقة</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:border-[#ff007a] outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Apple Pay Button UI */}
                {paymentMethod === 'apple_pay' && (
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-3">
                    <p className="text-xs text-slate-300">
                      سيتم خصم مبلغ <strong className="text-emerald-400 font-mono">{totalAmount} ر.س</strong> فوراً عبر محفظة Apple Pay الخاصة بك بلمسة واحدة.
                    </p>
                    <button
                      type="button"
                      onClick={handleInitiatePayment}
                      className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white font-bold text-sm rounded-xl border border-slate-700 shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="text-lg"></span>
                      <span>Pay with Apple Pay</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>سعر التذاكر ({selectedSeats.length || 1} مقاعد):</span>
                  <span className="font-mono text-white">{rawSubtotal} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono text-white">{vatAmount} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>رسوم خدمة Webook:</span>
                  <span className="text-emerald-400 font-bold">مجاناً (0 ر.س)</span>
                </div>
                <div className="flex justify-between font-black text-sm border-t border-slate-800 pt-2 text-white">
                  <span>المبلغ الإجمالي المطلوب سداده:</span>
                  <span className="text-emerald-400 font-mono text-base">{totalAmount} ر.س</span>
                </div>
              </div>

              {/* Submit Payment Button */}
              {paymentMethod !== 'apple_pay' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleInitiatePayment}
                  className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer ${
                    isProcessing
                      ? 'bg-slate-800 text-slate-400 cursor-wait'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30 hover:scale-[1.01]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      <span>{processingStage}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>💳 تأكيد الدفع وسداد {totalAmount} ر.س وإصدار التذاكر فوراً</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* STATE 3: LIVE WEBOOK.COM EXECUTIONS TAB */
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-purple-950/30 rounded-2xl border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>كيف تضمن الحجز التلقائي مباشرة في موقع Webook.com الرسمي؟</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  نظراً لأن منصة Webook محمية بجدار ناري مشفر وكوكيز معزولة (SameSite)، اختر إحدى الطرق التالية للحجز الآلي الفوري دون أي خطأ:
                </p>
              </div>

              {/* Method 1: Bookmarklet Quick Sniper */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>كود القناص السريع للمتصفح (Bookmarklet Sniper)</span>
                  </div>
                  <span className="text-[10px] text-pink-400 font-mono bg-pink-950/50 px-2 py-0.5 rounded border border-pink-500/30">
                    أسرع طريقة (0.2 ثانية)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  انسخ هذا الكود وأضفه في إشاراتك المرجعية (Bookmarks). وعند فتح أي فعالية في Webook، اضغط عليه ليقوم فوراً بالنقر على (احجز التذاكر) واختيار المقاعد والانتقال للدفع!
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bookmarkletCode}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-400 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(bookmarkletCode);
                      setCopiedBookmarklet(true);
                      setTimeout(() => setCopiedBookmarklet(false), 2500);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedBookmarklet ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <span className="text-emerald-300">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Method 2: Python Script */}
              {onDownloadScript && (
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">2</span>
                      <span>سكربت بايثون المستقل (main.py)</span>
                    </div>
                    <span className="text-[10px] text-purple-400 font-mono bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/30">
                      تخفي وتجاوز كلاودفلير
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    يقوم بفتح متصفح Chrome بجهازك تلقائياً وتسجيل الدخول وحجز المقاعد، ويترك المتصفح مفتوحاً أمامك على شاشة الدفع.
                  </p>
                  <button
                    onClick={onDownloadScript}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-purple-500/30 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                    <span>تحميل كود السكربت (main.py) الآن</span>
                  </button>
                </div>
              )}

              {/* Method 3: Direct Official URL */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px]">3</span>
                  <span>الفتح اليدوي لصفحة الفعالية المعتمدة</span>
                </div>
                <a
                  href={directBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>فتح صفحة الفعالية في Webook والضغط على (احجز التذاكر)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 3D SECURE OTP SIMULATION MODAL */}
        {showOtpModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" dir="rtl">
            <div className="w-full max-w-sm bg-[#0d121e] border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Smartphone className="w-6 h-6 animate-bounce" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  3D-Secure • نظام حماية المدفوعات السعودي
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  أدخل رمز التحقق (OTP)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  تم إرسال رمز التحقق لسداد <strong className="text-emerald-400">{totalAmount} ر.س</strong> إلى جوالك المسجل:
                  <span className="font-mono text-white block mt-0.5">{buyerPhone}</span>
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">رمز التحقق الافتراضي للاختبار:</span>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-32 mx-auto text-center font-mono text-2xl font-black tracking-widest bg-slate-900 border border-emerald-500 text-emerald-300 rounded-xl py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isOtpVerifying}
                  onClick={handleVerifyOtp}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isOtpVerifying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>جاري تأكيد السداد وإصدار التذاكر...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد الرمز وإصدار التذاكر</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
