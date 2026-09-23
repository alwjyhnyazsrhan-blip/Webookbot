import React, { useState } from 'react';
import { 
  Calendar, MapPin, Ticket, ExternalLink, Sparkles, 
  Search, Check, Filter, Layers, Flame, ArrowRight, Eye, ChevronDown
} from 'lucide-react';
import { WebookEvent, BotConfig } from '../types/bot';
import { generateVenueSeatingMap } from '../services/webookSyncService';

interface EventSelectorProps {
  events: WebookEvent[];
  currentEvent: WebookEvent;
  onSelectEvent: (event: WebookEvent) => void;
  config: BotConfig;
  onUpdateConfig: (config: Partial<BotConfig>) => void;
  onSwitchToMapTab?: () => void;
}

export const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  currentEvent,
  onSelectEvent,
  config,
  onUpdateConfig,
  onSwitchToMapTab,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const categories = [
    { id: 'all', label: 'كافة الفعاليات الرسمية (440+)' },
    { id: 'رياضة ومباريات', label: '⚽ رياضة ومباريات' },
    { id: 'دوري روشن', label: '🏆 دوري روشن السعودي' },
    { id: 'حفلات وموسيقى', label: '🎶 حفلات موسيقية' },
    { id: 'مسرح وكوميديا', label: '🎭 مسرح وكوميديا' },
    { id: 'مناطق وتجارب ترفيهية', label: '🎡 تجارب ومناطق ترفيهية' },
  ];

  const filteredEvents = events.filter((e) => {
    const matchesSearch = 
      e.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.locationAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'all' || 
      e.category === selectedCategory ||
      (selectedCategory === 'دوري روشن' && (e.titleAr.includes('روشن') || e.titleAr.includes('الهلال') || e.titleAr.includes('النصر') || e.titleAr.includes('الشباب') || e.titleAr.includes('الاتفاق')));

    return matchesSearch && matchesCategory;
  });

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const urlClean = customUrl.trim();
    const slugMatch = urlClean.match(/events\/([^/?#]+)/);
    const slug = slugMatch ? slugMatch[1] : 'custom-event-' + Date.now();

    const isStadiumGuess = /stadium|arena|derby|match|hilal|nassr|ittihad/i.test(slug);
    const seatingType = isStadiumGuess ? 'stadium' : 'theater';

    const newCustomEvent: WebookEvent = {
      id: slug,
      title: 'Custom Webook Event',
      titleAr: 'فعالية Webook مجلوبة بالرابط',
      slug: slug,
      url: urlClean,
      category: 'فعاليات مخصصة',
      location: 'Saudi Arabia',
      locationAr: 'المملكة العربية السعودية',
      date: 'تاريخ الحدث',
      datesAvailable: ['2024-12-07', '2024-12-08'],
      timesAvailable: ['21:30 - 23:00'],
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop',
      tiers: [
        { id: 'regular', name: 'Regular', nameAr: 'المقاعد العادية (Regular)', price: 85, available: true },
        { id: 'vip', name: 'VIP', nameAr: 'كبار الشخصيات (VIP)', price: 150, available: true }
      ],
      seatingMap: generateVenueSeatingMap(seatingType, 'موقع الفعالية المخصص'),
    };

    onSelectEvent(newCustomEvent);
    onUpdateConfig({
      targetEventUrl: urlClean,
      selectedEventId: newCustomEvent.id,
    });
    setCustomUrl('');
    setShowCustomInput(false);
  };

  const handleCardClick = (event: WebookEvent) => {
    onSelectEvent(event);
    onUpdateConfig({
      targetEventUrl: event.url,
      selectedEventId: event.id,
      selectedDate: event.datesAvailable[0] || '2024-12-07',
      selectedTime: event.timesAvailable[0] || '21:30 - 23:00',
    });
    if (onSwitchToMapTab) {
      onSwitchToMapTab();
    }
  };

  return (
    <div className="bg-[#0b0e14] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              قائمة الفعاليات المجلوبة تلقائياً
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({events.length} فعالية نشطة)
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            اختر أي فعالية لعرض مخطط مقاعدها الرسمي وقنص التذاكر
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            يتم تحديث الفعاليات وجلب مخططاتها المختلفة تلقائياً دون أي تدخل منك.
          </p>
        </div>

        {/* Search Input & Custom URL Toggle */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في فعاليات Webook..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            {showCustomInput ? 'إخفاء الرابط المخصص' : '+ رابط يدوي'}
          </button>
        </div>
      </div>

      {/* Custom URL Form if opened */}
      {showCustomInput && (
        <form onSubmit={handleApplyCustomUrl} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="الصق رابط أي فعالية أخرى من webook.com (مثال: https://webook.com/ar/events/...)"
            className="flex-1 bg-[#121622] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          >
            جلب الفعالية ومخططها
          </button>
        </form>
      )}

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.slice(0, visibleCount).map((event) => {
          const isSelected = currentEvent.id === event.id;
          const minPrice = Math.min(...event.tiers.map((t) => t.price));
          const mapTypeLabel = 
            event.seatingMap.type === 'stadium' 
              ? '🏟️ مخطط ملعب واستاد' 
              : event.seatingMap.type === 'concert'
              ? '🎶 مخطط أرينا وحفلات'
              : '🎭 مخطط مسرح وقاعة';

          return (
            <div
              key={event.id}
              onClick={() => handleCardClick(event)}
              className={`rounded-2xl overflow-hidden border transition-all cursor-pointer group flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-950/20 border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                {/* Event Poster Header */}
                <div className="relative h-40 overflow-hidden bg-slate-950">
                  <img
                    src={event.image}
                    alt={event.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Hot / Category Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {event.isHot && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>طلب مرتفع</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/80 text-white backdrop-blur-sm shadow-md">
                      {event.category}
                    </span>
                  </div>

                  {/* Seating Map Type Badge */}
                  <div className="absolute bottom-2.5 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-700 text-[11px] text-purple-200 font-medium">
                    {mapTypeLabel}
                  </div>

                  {/* Selected Tick Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-4 space-y-2.5">
                  <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition line-clamp-1">
                    {event.titleAr}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{event.locationAr}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">الأسعار تبدأ من:</span>
                  <span className="text-sm font-black text-white font-mono">
                    {minPrice} <span className="text-xs text-purple-400">ر.س</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={event.url || 'https://webook.com/ar/explore'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="فتح صفحة الفعالية على webook.com"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-purple-600 group-hover:text-white'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>مخطط المقاعد</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length > visibleCount && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer inline-flex items-center gap-2"
          >
            <span>عرض المزيد من فعاليات Webook الرسمية (متبقي {filteredEvents.length - visibleCount} فعالية)</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
};
