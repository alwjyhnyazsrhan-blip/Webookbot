import React, { useState } from 'react';
import { 
  X, Ticket, Calendar, MapPin, Clock, ShieldCheck, 
  Download, Copy, CheckCheck, Trash2, ExternalLink, QrCode
} from 'lucide-react';
import { ConfirmedBooking } from '../types/bot';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: ConfirmedBooking[];
  onRemoveBooking: (id: string) => void;
  onOpenBookingDetails?: (booking: ConfirmedBooking) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onRemoveBooking,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyRef = (ref: string, id: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReceipt = (b: ConfirmedBooking) => {
    const text = `
=====================================================
            منصة WEBOOK - تذكرة رسمية معتمدة
=====================================================
رقم الحجز المرجعي: ${b.referenceCode}
الفعالية: ${b.eventTitle}
التاريخ: ${b.eventDate} - ${b.eventTime}
الموقع: ${b.eventLocation}
البوابة: ${b.gate}
المستفيد: ${b.customerName}
المقاعد المحجوزة: ${b.seats.map(s => `صف ${s.row} - مقعد ${s.number} (${s.tierNameAr})`).join('، ')}
المبلغ المسدد: ${b.totalPrice} ر.س (${b.paymentMethod.toUpperCase()})
الباركود: ${b.barcode}
تاريخ الإصدار: ${b.bookedAt}
=====================================================
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Webook_Pass_${b.referenceCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-3xl bg-[#090c13] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="bg-[#0f1422] p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">حجوزاتي وتذاكري المعتمدة</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {bookings.length} تذكرة نشطة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                قائمة التذاكر المسددة والمؤكدة رسمياً الصالحة للدخول عبر بوابات الفعاليات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition cursor-pointer text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="p-10 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-900">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-600 mx-auto flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">لا توجد تذاكر مؤكدة بعد</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                عند تشغيل البوت القناص وسداد التذاكر بنجاح، ستصدر التذاكر الرسمية مع الباركود وتُحفظ هنا فوراً.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.eventImage}
                      alt={booking.eventTitle}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 font-bold inline-block mb-1">
                        CONFIRMED • مؤكد ومسدد
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {booking.eventTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-pink-400" />
                        <span>{booking.eventLocation}</span>
                        <span>•</span>
                        <span>{booking.eventDate} ({booking.eventTime})</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-[11px] text-slate-400 block">رقم الحجز المرجعي:</span>
                    <span className="text-sm font-black text-purple-300">{booking.referenceCode}</span>
                  </div>
                </div>

                {/* Seats and Barcode Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {booking.seats.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-mono font-bold text-xs"
                        >
                          صف {s.row} - مقعد {s.number} ({s.tierNameAr})
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap gap-3">
                      <span>البوابة: <strong className="text-white">{booking.gate}</strong></span>
                      <span>المستفيد: <strong className="text-white">{booking.customerName}</strong></span>
                      <span>المبلغ المدفوع: <strong className="text-emerald-400 font-mono">{booking.totalPrice} ر.س</strong></span>
                      <span>طريقة الدفع: <strong className="text-slate-300 uppercase">{booking.paymentMethod}</strong></span>
                    </div>
                  </div>

                  {/* Simulated QR Code Thumbnail */}
                  <div className="flex items-center justify-end gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
                      <QrCode className="w-10 h-10 text-slate-950" />
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-400">
                      <span className="block text-emerald-400 font-bold">READY TO SCAN</span>
                      <span>{booking.barcode}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(booking)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل التذكرة كـ PDF</span>
                    </button>

                    <button
                      onClick={() => handleCopyRef(booking.referenceCode, booking.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedId === booking.id ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>نسخ الرقم المرجعي</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveBooking(booking.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    title="حذف من السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
