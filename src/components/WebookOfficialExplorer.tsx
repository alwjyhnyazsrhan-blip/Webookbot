import React, { useState } from 'react';
import { 
  Search, Calendar, Clock, MapPin, Ticket, ExternalLink, 
  Sparkles, CheckCircle2, ChevronRight, ChevronDown, X, Shield, ArrowRight,
  Filter, Flame, Globe, Compass, Plus, AlertCircle, ShoppingCart
} from 'lucide-react';
import { WebookEvent } from '../types/bot';

interface WebookOfficialExplorerProps {
  events: WebookEvent[];
  selectedEvent: WebookEvent;
  onSelectEvent: (event: WebookEvent, directToMap?: boolean) => void;
  onAddCustomUrl: (url: string) => void;
}

export const WebookOfficialExplorer: React.FC<WebookOfficialExplorerProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onAddCustomUrl,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailEvent, setDetailEvent] = useState<WebookEvent | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [showAddUrlBox, setShowAddUrlBox] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const categories = [
    { id: 'all', label: 'جميع الفعاليات (440+)' },
    { id: 'رياضة ومباريات', label: '⚽ رياضة ومباريات' },
    { id: 'دوري روشن السعودي', label: '🏆 دوري روشن وكأس الملك' },
    { id: 'حفلات وموسيقى', label: '🎶 حفلات وموسيقى' },
    { id: 'مسرح وكوميديا', label: '🎭 مسرح وستاند أب' },
    { id: 'مناطق وتجارب ترفيهية', label: '🎡 تجارب ومناطق ترفيهية' },
    { id: 'مغامرات وأنشطة', label: '🧗 مغامرات وأنشطة' },
    { id: 'موسم الرياض', label: '✨ موسم الرياض والقدية' },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesCategory =
      activeCategory === 'all' ||
      ev.category.includes(activeCategory) ||
      (activeCategory === 'رياضة ومباريات' && (ev.category.includes('رياضة') || ev.titleAr.includes('كأس') || ev.titleAr.includes('مباراة') || ev.titleAr.includes('دوري') || ev.titleAr.includes('سباق') || ev.titleAr.includes('فروسية'))) ||
      (activeCategory === 'دوري روشن السعودي' && (ev.titleAr.includes('روشن') || ev.titleAr.includes('الهلال') || ev.titleAr.includes('النصر') || ev.titleAr.includes('الاتحاد') || ev.titleAr.includes('الشباب') || ev.titleAr.includes('الاتفاق') || ev.titleAr.includes('الفتح') || ev.titleAr.includes('الخلود'))) ||
      (activeCategory === 'حفلات وموسيقى' && (ev.category.includes('حفلات') || ev.category.includes('موسيقى') || ev.titleAr.includes('حفل') || ev.titleAr.includes('أوركسترا') || ev.titleAr.includes('عايض') || ev.titleAr.includes('ويرهاوس') || ev.titleAr.includes('كاريوكي'))) ||
      (activeCategory === 'مسرح وكوميديا' && (ev.category.includes('مسرح') || ev.category.includes('كوميديا') || ev.titleAr.includes('ستاند أب') || ev.titleAr.includes('مسرحية') || ev.titleAr.includes('لحد يدري') || ev.titleAr.includes('ثمانية'))) ||
      (activeCategory === 'مناطق وتجارب ترفيهية' && (ev.category.includes('مناطق') || ev.category.includes('تجارب') || ev.titleAr.includes('القدية') || ev.titleAr.includes('بوليفارد') || ev.titleAr.includes('فلاجز') || ev.titleAr.includes('أكوارابيا') || ev.titleAr.includes('فود سفير') || ev.titleAr.includes('متحف') || ev.titleAr.includes('فراشات'))) ||
      (activeCategory === 'موسم الرياض' && (ev.titleAr.includes('موسم الرياض') || ev.titleAr.includes('بوليفارد') || ev.titleAr.includes('القدية') || ev.locationAr.includes('الرياض')));

    const matchesSearch = 
      ev.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.locationAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = 
      selectedCity === 'all' || 
      (selectedCity === 'riyadh' && ev.locationAr.includes('الرياض')) ||
      (selectedCity === 'jeddah' && ev.locationAr.includes('جدة')) ||
      (selectedCity === 'dammam' && (ev.locationAr.includes('الدمام') || ev.locationAr.includes('الخبر') || ev.locationAr.includes('الأحساء'))) ||
      (selectedCity === 'madinah' && ev.locationAr.includes('المدينة'));

    return matchesCategory && matchesSearch && matchesCity;
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    onAddCustomUrl(customUrlInput.trim());
    setCustomUrlInput('');
    setShowAddUrlBox(false);
  };

  const heroEvent = events[0] || selectedEvent;

  return (
    <div className="space-y-6">
      {/* Top Webook Notice Banner (Same as Screenshot: وظائف للمبدعين فقط، قدّم الآن!) */}
      <div className="bg-gradient-to-r from-[#ff007a] via-[#e11d48] to-[#db2777] text-white py-2 px-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg shadow-pink-600/20">
        <div className="flex items-center gap-2 mx-auto">
          <Sparkles className="w-4 h-4 animate-bounce" />
          <span>✨ وظائف للمبدعين فقط في Webook، قدّم الآن! ✨</span>
        </div>
        <a 
          href="https://webook.com/ar/explore" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:underline text-[11px] hidden sm:flex items-center gap-1 opacity-90 hover:opacity-100"
        >
          <span>تصفح Webook</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Official Webook Search & Filter Navigation Bar */}
      <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <div className="bg-[#ff007a] text-white px-3 py-1 rounded-xl font-black text-sm tracking-wider shadow-md shadow-pink-600/40">
                WBK
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">
                  webook<span className="text-[#ff007a]">.com</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  منصة استكشاف الفعاليات وحجز التذاكر الرسمية
                </span>
              </div>
            </div>

            {/* Direct URL Importer Button */}
            <button
              onClick={() => setShowAddUrlBox(!showAddUrlBox)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 rounded-xl text-xs font-bold transition cursor-pointer"
              title="إضافة رابط فعالية مخصص من Webook"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة رابط فعالية</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث في فعاليات، مسارح، مباريات، وتجارب Webook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#ff007a] focus:outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full md:w-auto justify-center overflow-x-auto">
            <button
              onClick={() => { setSelectedCity('all'); setVisibleCount(24); }}
              className={`px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                selectedCity === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({events.length})
            </button>
            <button
              onClick={() => { setSelectedCity('riyadh'); setVisibleCount(24); }}
              className={`px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                selectedCity === 'riyadh' ? 'bg-[#ff007a] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              الرياض
            </button>
            <button
              onClick={() => { setSelectedCity('jeddah'); setVisibleCount(24); }}
              className={`px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                selectedCity === 'jeddah' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              جدة
            </button>
            <button
              onClick={() => { setSelectedCity('dammam'); setVisibleCount(24); }}
              className={`px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                selectedCity === 'dammam' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              الشرقية
            </button>
            <button
              onClick={() => { setSelectedCity('madinah'); setVisibleCount(24); }}
              className={`px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer whitespace-nowrap ${
                selectedCity === 'madinah' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              المدينة
            </button>
          </div>
        </div>

        {/* Custom URL Import Drawer */}
        {showAddUrlBox && (
          <form
            onSubmit={handleAddCustom}
            className="p-4 bg-slate-900/90 border border-purple-500/40 rounded-xl space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>إضافة أي رابط فعالية مخصص من موقع Webook</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddUrlBox(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://webook.com/ar/events/..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
              >
                استيراد وتفعيل
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              يقوم النظام بتحليل الرابط فوراً وبناء مخطط مقاعد مخصص له لربطه بالبوت وقنص التذاكر.
            </p>
          </form>
        )}

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin border-t border-slate-800/80 pt-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ff007a] text-white shadow-lg shadow-pink-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Hero Event Banner (Matching Webook homepage highlight) */}
      {heroEvent && activeCategory === 'all' && !searchQuery && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
          <div className="absolute inset-0">
            <img
              src={heroEvent.bannerImage || heroEvent.image}
              alt={heroEvent.titleAr}
              className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/70 to-transparent" />
          </div>

          <div className="relative p-6 sm:p-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff007a]/20 border border-[#ff007a]/40 text-[#ff007a] text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>الفعالية الأكثر طلباً في Webook</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {heroEvent.titleAr}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {heroEvent.descriptionAr || 'استمتع بأقوى التجارب والفعاليات العالمية مع أفضل المقاعد المتاحة.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-4 h-4 text-pink-500" />
                <strong className="text-white font-medium">{heroEvent.locationAr}</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-slate-200">{heroEvent.date}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                <Ticket className="w-4 h-4" />
                <span>تبدأ من {heroEvent.tiers[0]?.price} ر.س</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => onSelectEvent(heroEvent, true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>⚡ قنص وحجز فوري عبر البوت (التوجه للدفع فقط)</span>
              </button>

              <button
                onClick={() => setDetailEvent(heroEvent)}
                className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
              >
                عرض تفاصيل الفعالية والشروط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Real Webook Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white">
              فعاليات Webook الرسمية المتاحة
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold">
              {filteredEvents.length} فعالية
            </span>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>متزامنة ومربوطة بمخططات المقاعد</span>
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">لا توجد فعاليات مطابقة للبحث</h4>
            <p className="text-xs text-slate-400">جرب البحث بكلمة أخرى أو اختر تصنيفاً آخر، أو أضف رابط الفعالية مباشرة.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.slice(0, visibleCount).map((event) => {
                const isSelected = selectedEvent.id === event.id;
                const minPrice = Math.min(...event.tiers.map((t) => t.price));

                return (
                  <div
                    key={event.id}
                    className={`bg-[#0b0e14] rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-200 group hover:border-[#ff007a]/50 hover:shadow-xl hover:shadow-pink-600/10 ${
                      isSelected ? 'border-[#ff007a] ring-2 ring-[#ff007a]/30' : 'border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Event Poster Image */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                        <img
                          src={event.image}
                          alt={event.titleAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-[#0b0e14]/90 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-white">
                            {event.category}
                          </span>

                          {event.isHot && (
                            <span className="px-2 py-0.5 rounded-lg bg-[#ff007a] text-white text-[10px] font-black shadow-md flex items-center gap-1">
                              <Flame className="w-3 h-3 fill-white" />
                              <span>طلب عالي</span>
                            </span>
                          )}
                        </div>

                        {/* Price Badge on Image */}
                        <div className="absolute bottom-2.5 right-3 bg-[#0b0e14]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs font-mono font-bold text-emerald-400">
                          يبدأ من {minPrice} ر.س
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#ff007a] transition-colors line-clamp-1">
                            {event.titleAr}
                          </h4>
                          <span className="text-[11px] text-slate-400 line-clamp-1 font-sans">
                            {event.title}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span className="truncate">{event.locationAr}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{event.date}</span>
                          </div>
                        </div>

                        {/* Tiers Preview */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {event.tiers.slice(0, 3).map((tier) => (
                            <span
                              key={tier.id}
                              className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium"
                            >
                              {tier.nameAr.split(' ')[0]} ({tier.price} ر.س)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-0 border-t border-slate-900 space-y-2">
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => onSelectEvent(event, true)}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>⚡ قنص وحجز (الدفع فقط)</span>
                        </button>

                        <button
                          onClick={() => setDetailEvent(event)}
                          className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs rounded-xl transition cursor-pointer text-center"
                        >
                          تفاصيل الفعالية
                        </button>
                      </div>

                      <a
                        href={event.url || "https://webook.com/ar/explore"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition"
                      >
                        <span>رابط الفعالية الرسمي في Webook</span>
                        <ExternalLink className="w-3 h-3 text-[#ff007a]" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Show More Button */}
            {filteredEvents.length > visibleCount && (
              <div className="text-center pt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-pink-400 hover:text-pink-300 border border-pink-500/30 hover:border-pink-500/60 rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-950/20 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>عرض المزيد من فعاليات Webook الرسمية (متبقي {filteredEvents.length - visibleCount} فعالية)</span>
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Official Webook Event Detail Modal */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header Image */}
            <div className="relative aspect-[21/9] w-full bg-slate-900">
              <img
                src={detailEvent.bannerImage || detailEvent.image}
                alt={detailEvent.titleAr}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent" />
              <button
                onClick={() => setDetailEvent(null)}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 right-5 left-5">
                <span className="px-2.5 py-1 rounded-lg bg-[#ff007a] text-white text-xs font-bold mb-2 inline-block">
                  {detailEvent.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {detailEvent.titleAr}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 space-y-5 text-right">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">الموقع والمقر:</span>
                  <strong className="text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span>{detailEvent.locationAr}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">التاريخ:</span>
                  <strong className="text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{detailEvent.date}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">الجهة المنظمة:</span>
                  <strong className="text-white flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{detailEvent.organizer || 'Webook Official'}</span>
                  </strong>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">نبذة عن الفعالية (About Event)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {detailEvent.descriptionAr || 'لا يوجد وصف مفصل متاح حالياً.'}
                </p>
              </div>

              {/* Ticket Tiers */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-white">فئات التذاكر المتاحة (Ticket Categories)</h4>
                <div className="space-y-2">
                  {detailEvent.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: tier.color || '#ff007a' }}
                          />
                          <strong className="text-white">{tier.nameAr}</strong>
                          <span className="text-slate-400">({tier.name})</span>
                        </div>
                        {tier.description && (
                          <p className="text-[11px] text-slate-400 mt-1 mr-4.5">
                            {tier.description}
                          </p>
                        )}
                      </div>

                      <div className="text-left font-mono">
                        <span className="text-sm font-bold text-white">{tier.price}</span>
                        <span className="text-[10px] text-purple-400 mr-1">ر.س</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              {detailEvent.termsAr && detailEvent.termsAr.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white">الشروط والأحكام الخاصة بالمنصة</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                    {detailEvent.termsAr.map((term, i) => (
                      <li key={i}>{term}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={detailEvent.url || "https://webook.com/ar/explore"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>فتح صفحة الفعالية على موقع Webook الرسمي</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#ff007a]" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setDetailEvent(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    onSelectEvent(detailEvent, true);
                    setDetailEvent(null);
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>⚡ فتح المخطط وقنص المقاعد (التوجه للدفع فقط)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
