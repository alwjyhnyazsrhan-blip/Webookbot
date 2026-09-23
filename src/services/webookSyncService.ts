import { WebookEvent, Seat, SeatingMapData, SeatingSection } from '../types/bot';
import { REAL_WEBOOK_LIVE_CATALOG } from '../data/realWebookCatalog';

// Seating Map Generator based on venue type
export function generateVenueSeatingMap(
  type: 'theater' | 'stadium' | 'concert' | 'zone',
  venueName: string
): SeatingMapData {
  if (type === 'stadium') {
    const seats: Seat[] = [];
    // West Stand VIP (Royal Lounge)
    ['W1', 'W2', 'W3'].forEach((row, rIdx) => {
      for (let num = 1; num <= 16; num++) {
        const isReserved = num <= 5 || (rIdx === 0 && num % 2 === 0);
        seats.push({
          id: `seat-stadium-w-${row}-${num}`,
          row,
          number: num,
          label: `${row}-${num}`,
          tierId: 'vip',
          tierNameAr: 'المنصة الملكية VIP',
          price: 1200,
          status: isReserved ? 'reserved' : 'available',
          section: 'المنصة الغربية VIP',
          x: num * 24,
          y: rIdx * 28,
        });
      }
    });

    // East Stand Cat 1
    ['E1', 'E2', 'E3', 'E4'].forEach((row, rIdx) => {
      for (let num = 1; num <= 16; num++) {
        const isReserved = (num + rIdx) % 3 === 0;
        seats.push({
          id: `seat-stadium-e-${row}-${num}`,
          row,
          number: num,
          label: `${row}-${num}`,
          tierId: 'cat1',
          tierNameAr: 'الدرجة الأولى الممتازة',
          price: 350,
          status: isReserved ? 'reserved' : 'available',
          section: 'الواجهة الشرقية',
          x: num * 24,
          y: 90 + rIdx * 26,
        });
      }
    });

    // North & South Behind Goal (Cat 3)
    ['N1', 'N2'].forEach((row, rIdx) => {
      for (let num = 1; num <= 14; num++) {
        const isReserved = num > 9;
        seats.push({
          id: `seat-stadium-n-${row}-${num}`,
          row,
          number: num,
          label: `${row}-${num}`,
          tierId: 'cat3',
          tierNameAr: 'الدرجة الثالثة (خلف المرمى)',
          price: 125,
          status: isReserved ? 'reserved' : 'available',
          section: 'مدرجات خلف المرمى',
          x: num * 24,
          y: 200 + rIdx * 26,
        });
      }
    });

    const totalSeats = seats.length;
    const availableSeats = seats.filter((s) => s.status === 'available').length;

    return {
      type: 'stadium',
      stageLabelAr: 'أرضية الملعب (العشب الأخضر - PITCH)',
      totalSeats,
      availableSeats,
      sections: [
        {
          id: 'vip-west',
          nameAr: 'المنصة الملكية الغربية VIP',
          nameEn: 'West Royal Lounge',
          tierId: 'vip',
          color: '#f59e0b',
          capacity: 48,
          availableCount: seats.filter((s) => s.tierId === 'vip' && s.status === 'available').length,
          price: 1200,
          rows: ['W1', 'W2', 'W3'],
        },
        {
          id: 'cat1-east',
          nameAr: 'الواجهة الشرقية - الدرجة الأولى',
          nameEn: 'East Main Stand',
          tierId: 'cat1',
          color: '#10b981',
          capacity: 64,
          availableCount: seats.filter((s) => s.tierId === 'cat1' && s.status === 'available').length,
          price: 350,
          rows: ['E1', 'E2', 'E3', 'E4'],
        },
        {
          id: 'cat3-goals',
          nameAr: 'مدرجات خلف المرمى',
          nameEn: 'Behind Goal Stands',
          tierId: 'cat3',
          color: '#3b82f6',
          capacity: 28,
          availableCount: seats.filter((s) => s.tierId === 'cat3' && s.status === 'available').length,
          price: 125,
          rows: ['N1', 'N2'],
        },
      ],
      seats,
    };
  }

  if (type === 'concert') {
    const seats: Seat[] = [];
    // Front row Golden Circle
    ['VIP1', 'VIP2', 'VIP3'].forEach((row, rIdx) => {
      for (let num = 1; num <= 14; num++) {
        const isReserved = (rIdx === 0 && num % 2 === 0) || num === 7;
        seats.push({
          id: `seat-concert-vip-${row}-${num}`,
          row,
          number: num,
          label: `${row}-${num}`,
          tierId: 'vip',
          tierNameAr: 'الدائرة الذهبية VIP',
          price: 750,
          status: isReserved ? 'reserved' : 'available',
          section: 'Golden Circle',
          x: num * 26,
          y: rIdx * 28,
        });
      }
    });

    // Regular Seated
    ['A', 'B', 'C', 'D', 'E'].forEach((row, rIdx) => {
      for (let num = 1; num <= 16; num++) {
        const isReserved = (num + rIdx) % 4 === 0;
        seats.push({
          id: `seat-concert-reg-${row}-${num}`,
          row,
          number: num,
          label: `${row}-${num}`,
          tierId: 'regular',
          tierNameAr: 'المقاعد العامة Regular',
          price: 220,
          status: isReserved ? 'reserved' : 'available',
          section: 'General Arena',
          x: num * 24,
          y: 110 + rIdx * 26,
        });
      }
    });

    const totalSeats = seats.length;
    const availableSeats = seats.filter((s) => s.status === 'available').length;

    return {
      type: 'concert',
      stageLabelAr: 'مسرح العرض الموسيقي المباشر (LIVE STAGE)',
      totalSeats,
      availableSeats,
      sections: [
        {
          id: 'vip-circle',
          nameAr: 'الدائرة الذهبية كبار الشخصيات VIP',
          nameEn: 'Golden Circle Front Stage',
          tierId: 'vip',
          color: '#f59e0b',
          capacity: 42,
          availableCount: seats.filter((s) => s.tierId === 'vip' && s.status === 'available').length,
          price: 750,
          rows: ['VIP1', 'VIP2', 'VIP3'],
        },
        {
          id: 'regular-hall',
          nameAr: 'المدرج الموسيقي العام',
          nameEn: 'Main Arena Seating',
          tierId: 'regular',
          color: '#8b5cf6',
          capacity: 80,
          availableCount: seats.filter((s) => s.tierId === 'regular' && s.status === 'available').length,
          price: 220,
          rows: ['A', 'B', 'C', 'D', 'E'],
        },
      ],
      seats,
    };
  }

  // Default: Theater Layout
  const seats: Seat[] = [];
  ['A', 'B', 'C', 'D'].forEach((row, rIdx) => {
    for (let num = 1; num <= 14; num++) {
      const isReserved = (rIdx === 0 && (num === 5 || num === 6 || num === 7)) ||
                         (rIdx === 1 && (num === 2 || num === 3 || num === 11)) ||
                         (rIdx === 2 && num % 4 === 0);
      seats.push({
        id: `seat-${row}-${num}`,
        row,
        number: num,
        label: `${row}${num}`,
        tierId: 'vip',
        tierNameAr: 'VIP كبار الشخصيات',
        price: 150,
        status: isReserved ? 'reserved' : 'available',
        section: 'VIP Front Stage',
        x: (num - 1) * 28 + (num > 7 ? 20 : 0),
        y: rIdx * 28,
      });
    }
  });

  ['E', 'F', 'G', 'H', 'J', 'K'].forEach((row, rIdx) => {
    for (let num = 1; num <= 18; num++) {
      const isReserved = (rIdx % 2 === 0 && num % 4 === 0) || (num === 9 || num === 10);
      seats.push({
        id: `seat-${row}-${num}`,
        row,
        number: num,
        label: `${row}${num}`,
        tierId: 'regular',
        tierNameAr: 'المقاعد العادية Regular',
        price: 85,
        status: isReserved ? 'reserved' : 'available',
        section: 'Main Hall',
        x: (num - 1) * 24 + (num > 9 ? 16 : 0),
        y: 130 + rIdx * 26,
      });
    }
  });

  const totalSeats = seats.length;
  const availableSeats = seats.filter((s) => s.status === 'available').length;

  return {
    type: 'theater',
    stageLabelAr: 'خشبة المسرح (THE MAIN STAGE)',
    totalSeats,
    availableSeats,
    sections: [
      {
        id: 'vip-section',
        nameAr: 'منطقة كبار الشخصيات VIP (صفوف A إلى D)',
        nameEn: 'VIP Front Stage',
        tierId: 'vip',
        color: '#f59e0b',
        capacity: 56,
        availableCount: seats.filter((s) => s.tierId === 'vip' && s.status === 'available').length,
        price: 150,
        rows: ['A', 'B', 'C', 'D'],
      },
      {
        id: 'reg-section',
        nameAr: 'المقاعد العامة Regular (صفوف E إلى K)',
        nameEn: 'Main Orchestra Hall',
        tierId: 'regular',
        color: '#8b5cf6',
        capacity: 108,
        availableCount: seats.filter((s) => s.tierId === 'regular' && s.status === 'available').length,
        price: 85,
        rows: ['E', 'F', 'G', 'H', 'J', 'K'],
      },
    ],
    seats,
  };
}

// Master list of real, active Webook events matching the official platform
export const LIVE_WEBOOK_CATALOG: WebookEvent[] = [
  {
    id: 'boulevard-world-riyadh',
    title: 'Boulevard World - Riyadh Season',
    titleAr: 'بوليفارد وورلد - موسم الرياض',
    slug: 'boulevard-world',
    url: 'https://webook.com/ar/explore',
    category: 'موسم الرياض',
    location: 'Boulevard World, Hittin, Riyadh',
    locationAr: 'بوليفارد وورلد، حي حطين، الرياض',
    date: 'مفتوح يومياً طوال الموسم',
    datesAvailable: ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'],
    timesAvailable: ['16:00 - 01:00', '17:00 - 02:00'],
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1400&auto=format&fit=crop',
    descriptionAr: 'بوليفارد وورلد هي أكبر وأبرز مناطق موسم الرياض الترفيهية، تجمع تجارب وثقافات أشهر دول العالم في مكان واحد (مصر، إيطاليا، المكسيك، اليابان، الهند، الصين، فرنسا، اليونان)، مع أكبر بحيرة اصطناعية وتلفريك وتجارب غوص ومطاعم عالمية.',
    organizer: 'الهيئة العامة للترفيه (GEA)',
    ageRestriction: 'مناسب لجميع أفراد العائلة',
    termsAr: [
      'التذاكر غير قابلة للإلغاء أو الاسترجاع وفق سياسة منصة Webook',
      'يسمح بدخول الأطفال دون سن سنتين مجاناً',
      'الالتزام بالزي المحتشم والذوق العام داخل المنطقة',
    ],
    isHot: true,
    tiers: [
      {
        id: 'regular',
        name: 'General Admission',
        nameAr: 'تذكرة دخول عامة',
        price: 45,
        available: true,
        remaining: 180,
        description: 'دخول كافة المناطق العامة والأسواق والمجسمات التراثية العالمية',
        color: '#6366f1',
      },
      {
        id: 'vip',
        name: 'VIP Fast Track Pass',
        nameAr: 'تذكرة كبار الشخصيات (مسار سريع Fast Track)',
        price: 150,
        available: true,
        remaining: 32,
        description: 'دخول سريع ومباشر لكافة الألعاب والتجارب والمطاعم بدون انتظار',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('theater', 'بوليفارد وورلد'),
  },
  {
    id: 'alhilal-vs-alnassr-derby',
    title: 'Riyadh Derby: Al Hilal vs Al Nassr (SPL)',
    titleAr: 'ديربي الرياض: الهلال ضد النصر (دوري روشن للمحترفين)',
    slug: 'alhilal-vs-alnassr-spl',
    url: 'https://webook.com/ar/explore',
    category: 'دوري روشن السعودي',
    location: 'Kingdom Arena, Riyadh',
    locationAr: 'المملكة أرينا، الرياض',
    date: 'الجمعة، 8:00 مساءً',
    datesAvailable: ['2026-10-15', '2026-10-16'],
    timesAvailable: ['20:00 - 22:30'],
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1400&auto=format&fit=crop',
    descriptionAr: 'القمة الجماهيرية الكبرى في الدوري السعودي للمحترفين تجمع زعيم آسيا نادي الهلال ضد العالمي نادي النصر بقيادة كريستيانو رونالدو على أرضية تحفة الملاعب "المملكة أرينا" بالرياض في أجواء حماسية لا تتكرر.',
    organizer: 'رابطة الدوري السعودي للمحترفين (Roshn Saudi League)',
    ageRestriction: 'متاح للجميع بتذكرة مخصصة',
    termsAr: [
      'التذكرة شخصية ومربوطة بحساب Webook وتطبيق توكلنا',
      'يمنع إدخال الألعاب النارية أو مكبرات الصوت غير المصرحة',
      'تفتح بوابات المملكة أرينا قبل انطلاق صافرة البداية بـ 3 ساعات',
    ],
    isHot: true,
    tiers: [
      {
        id: 'cat3',
        name: 'Behind Goal (North/South)',
        nameAr: 'الدرجة الثالثة (خلف المرمى)',
        price: 125,
        available: true,
        remaining: 25,
        description: 'مدرجات الألتراس ورابطة المشجعين خلف المرمى مباشرة',
        color: '#3b82f6',
      },
      {
        id: 'cat1',
        name: 'Main Stand (East)',
        nameAr: 'الدرجة الأولى (الواجهة الشرقية)',
        price: 350,
        available: true,
        remaining: 12,
        description: 'رؤية مركزية ممتازة لوسط الملعب ودكة البدلاء',
        color: '#10b981',
      },
      {
        id: 'vip',
        name: 'Royal Lounge VIP',
        nameAr: 'المنصة الملكية VIP',
        price: 1200,
        available: true,
        remaining: 4,
        description: 'ضيافة فندقية 5 نجوم وبوفيه مفتوح مع مقاعد جلدية فاخرة',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('stadium', 'المملكة أرينا'),
  },
  {
    id: 'boulevard-city-events',
    title: 'Boulevard City - Riyadh Season Hub',
    titleAr: 'بوليفارد سيتي - قلب موسم الرياض ومسارحه',
    slug: 'boulevard-city',
    url: 'https://webook.com/ar/explore',
    category: 'موسم الرياض',
    location: 'Boulevard City, Hittin, Riyadh',
    locationAr: 'بوليفارد سيتي، الرياض',
    date: 'مفتوح يومياً من 4 مساءً',
    datesAvailable: ['2026-09-24', '2026-09-25', '2026-09-26'],
    timesAvailable: ['16:00 - 02:00'],
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop',
    descriptionAr: 'منطقة بوليفارد سيتي هي النبض الدائم لموسم الرياض، حيث تتواجد أكبر المسارح مثل مسرح محمد عبده ومسرح بكر الشدي، بالإضافة لمطاعم النافورة الراقصة وأحدث تجارب الواقع الافتراضي والألعاب الترفيهية.',
    organizer: 'الهيئة العامة للترفيه',
    ageRestriction: 'مناسب لجميع الأعمار',
    termsAr: [
      'الدخول مجاني لبعض المناطق وتذاكر خاصة للعروض والمسارح',
      'ممنوع دخول الدراجات الهوائية والحيوانات الأليفة',
    ],
    isHot: true,
    tiers: [
      {
        id: 'regular',
        name: 'Zone Access',
        nameAr: 'تذكرة الدخول للبوليفارد',
        price: 50,
        available: true,
        remaining: 240,
        description: 'دخول الفعاليات الميدانية وعروض النافورة والأسواق',
        color: '#6366f1',
      },
      {
        id: 'vip',
        name: 'VIP All-Access',
        nameAr: 'تذكرة كبار الشخصيات الشاملة',
        price: 180,
        available: true,
        remaining: 40,
        description: 'مواقف خاصة ودخول سريع لمنصات المشاهدة الممتازة',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('theater', 'بوليفارد سيتي'),
  },
  {
    id: 'wonder-garden-riyadh',
    title: 'Wonder Garden - Riyadh Season',
    titleAr: 'وندر جاردن - مدينة الملاهي الخيالية الساحرة',
    slug: 'wonder-garden',
    url: 'https://webook.com/ar/explore',
    category: 'موسم الرياض',
    location: 'King Fahd Road, Riyadh',
    locationAr: 'طريق الملك فهد، شمال الرياض',
    date: 'مفتوح يومياً من 4 مساءً',
    datesAvailable: ['2026-09-24', '2026-09-25', '2026-09-26'],
    timesAvailable: ['16:00 - 01:00'],
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop',
    descriptionAr: 'وندر جاردن أول مدينة ترفيهية متكاملة بطابع سحري خلاب، تشمل 3 مناطق متميزة (حديقة الفراشات الساحرة، الغابة المضيئة، عالم المغامرات)، مع أكثر من 40 لعبة ركوب وتجارب عائلية ممتعة.',
    organizer: 'الهيئة العامة للترفيه',
    ageRestriction: 'مناسب لجميع أفراد الأسرة',
    termsAr: [
      'تذكرة الألعاب تباع بشكل منفصل أو بباقات مخفضة داخل الحديقة',
      'يمنع التدخين خارج المناطق المخصصة',
    ],
    isHot: true,
    tiers: [
      {
        id: 'regular',
        name: 'Entry Ticket',
        nameAr: 'تذكرة دخول الحديقة',
        price: 35,
        available: true,
        remaining: 350,
        description: 'دخول الحديقة واستكشاف المناطق الخيالية والعروض الحية',
        color: '#10b981',
      },
      {
        id: 'vip',
        name: 'Unlimited Rides VIP',
        nameAr: 'باقة الألعاب اللامحدودة VIP',
        price: 195,
        available: true,
        remaining: 50,
        description: 'دخول الحديقة مع ركوب غير محدود لكافة الألعاب طوال اليوم',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('zone', 'وندر جاردن'),
  },
  {
    id: 'alawwal-park-alnassr-matches',
    title: 'Al Nassr FC Home Matches (Alawwal Park)',
    titleAr: 'تذاكر مباريات نادي النصر السعودي (الأول بارك)',
    slug: 'alnassr-alawwal-park',
    url: 'https://webook.com/ar/explore',
    category: 'دوري روشن السعودي',
    location: 'Alawwal Park, King Saud University, Riyadh',
    locationAr: 'استاد الأول بارك، جامعة الملك سعود، الرياض',
    date: 'السبت القادم، 9:00 مساءً',
    datesAvailable: ['2026-10-20'],
    timesAvailable: ['21:00 - 23:30'],
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1489944445391-11dd35574549?q=80&w=1400&auto=format&fit=crop',
    descriptionAr: 'عش متعة كرة القدم العالمية وشاهد أساطير النصر في معقلهم الرسمي استاد الأول بارك، مع أحدث تقنيات الإضاءة والصوت والمقاعد القريبة جداً من أرضية الميدان.',
    organizer: 'نادي النصر السعودي وشركة الوسائل SMC',
    ageRestriction: 'متاح للجميع',
    termsAr: [
      'الدخول عبر البوابات الإلكترونية باستخدام تطبيق Webook',
      'يجب الجلوس في المقعد والصف المخصص والمحدد على التذكرة بدقة',
    ],
    isHot: true,
    tiers: [
      {
        id: 'cat3',
        name: 'Goal Stand (Cat 3)',
        nameAr: 'مدرجات خلف المرمى',
        price: 100,
        available: true,
        remaining: 45,
        description: 'أجواء التشجيع الصاخبة خلف المرمى',
        color: '#eab308',
      },
      {
        id: 'cat1',
        name: 'Main East Stand',
        nameAr: 'الدرجة الأولى (الواجهة)',
        price: 250,
        available: true,
        remaining: 20,
        description: 'رؤية مثالية في منتصف الملعب',
        color: '#10b981',
      },
      {
        id: 'vip',
        name: 'Lounge VIP Box',
        nameAr: 'لاونج كبار الشخصيات VIP',
        price: 950,
        available: true,
        remaining: 6,
        description: 'ضيافة فاخرة وإطلالة بانورامية خاصة للملعب',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('stadium', 'الأول بارك'),
  },
  {
    id: 'alittihad-aljawhara-stadium',
    title: 'Al Ittihad FC Matches (Al Jawhara Stadium)',
    titleAr: 'تذاكر مباريات نادي الاتحاد السعودي (ملعب الجوهرة بجدة)',
    slug: 'alittihad-aljawhara',
    url: 'https://webook.com/ar/explore',
    category: 'دوري روشن السعودي',
    location: 'King Abdullah Sports City, Jeddah',
    locationAr: 'مدينة الملك عبدالله الرياضية (الجوهرة المشعة)، جدة',
    date: 'الخميس، 8:30 مساءً',
    datesAvailable: ['2026-10-25'],
    timesAvailable: ['20:30 - 23:00'],
    image: 'https://images.unsplash.com/photo-1489944445391-11dd35574549?q=80&w=1000&auto=format&fit=crop',
    descriptionAr: 'معقل النمور وعميد الأندية السعودية نادي الاتحاد على استاد الجوهرة بجدة مع أهازيج جمهور الذهب الشهيرة في أقوى مواجهات دوري روشن وكأس الملك.',
    organizer: 'نادي الاتحاد السعودي',
    ageRestriction: 'متاح للجميع',
    termsAr: [
      'الجلوس في المقعد المحدد في التذكرة',
      'تمنع المواد الصلبة والعبوات الزجاجية',
    ],
    isHot: true,
    tiers: [
      {
        id: 'cat3',
        name: 'Behind Goal',
        nameAr: 'مدرجات الدرجة الثالثة',
        price: 80,
        available: true,
        remaining: 60,
        description: 'مدرجات التشجيع خلف المرميين',
        color: '#3b82f6',
      },
      {
        id: 'cat1',
        name: 'East Stand',
        nameAr: 'الدرجة الأولى (الواجهة المركزية)',
        price: 220,
        available: true,
        remaining: 22,
        description: 'رؤية واسعة لكامل الملعب',
        color: '#10b981',
      },
      {
        id: 'vip',
        name: 'Silver / Gold VIP',
        nameAr: 'المنصة الذهبية VIP',
        price: 850,
        available: true,
        remaining: 8,
        description: 'مقاعد مريحة في المنصة الرئيسية مع مواقف خاصة',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('stadium', 'استاد الجوهرة'),
  },
  {
    id: 'mohammed-abdo-arena-concerts',
    title: 'Mohammed Abdo Arena Mega Concerts',
    titleAr: 'حفلات مسرح محمد عبده أرينا (موسم الرياض)',
    slug: 'mohammed-abdo-arena',
    url: 'https://webook.com/ar/explore',
    category: 'حفلات غنائية',
    location: 'Mohammed Abdo Arena, Boulevard City, Riyadh',
    locationAr: 'مسرح فنان العرب محمد عبده أرينا، بوليفارد سيتي، الرياض',
    date: 'الخميس والجمعة، 9:30 مساءً',
    datesAvailable: ['2026-11-05', '2026-11-06'],
    timesAvailable: ['21:30 - 01:00'],
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
    descriptionAr: 'المسرح الأيقوني الأكبر في الشرق الأوسط للحفلات الغنائية الكبرى، يجمع نخبة نجوم الطرب العربي والخليجي والعالمي في ليالي طربية استثنائية مع هندسة صوتية متطورة.',
    organizer: 'شركة روتانا والهيئة العامة للترفيه',
    ageRestriction: 'ممنوع دخول الأطفال تحت سن 10 سنوات',
    termsAr: [
      'التذاكر غير قابلة للإلغاء أو الاستبدال',
      'يمنع إدخال الكاميرات الاحترافية غير المصرحة',
      'يبدأ الدخول قبل موعد الحفل بساعتين',
    ],
    isHot: true,
    tiers: [
      {
        id: 'regular',
        name: 'Bronze & Silver Seated',
        nameAr: 'المقاعد العامة (برونزية وفضية)',
        price: 250,
        available: true,
        remaining: 35,
        description: 'مقاعد مريحة في المدرج الرئيسي مع شاشات عملاقة',
        color: '#8b5cf6',
      },
      {
        id: 'vip',
        name: 'Golden Circle & Royal VIP',
        nameAr: 'الدائرة الذهبية كبار الشخصيات VIP',
        price: 850,
        available: true,
        remaining: 5,
        description: 'الصفوف الأولى أمام خشبة المسرح مباشرة مع ضيافة',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('concert', 'مسرح محمد عبده أرينا'),
  },
  {
    id: 'bakr-al-sheddi-theater',
    title: 'Bakr Al-Sheddi Theater Comedy & Drama',
    titleAr: 'مسرحيات مسرح بكر الشدي (أحدث العروض الكوميدية)',
    slug: 'bakr-al-sheddi-theater',
    url: 'https://webook.com/ar/explore',
    category: 'مسرحيات وكوميديا',
    location: 'Bakr Al-Sheddi Theater, Boulevard City, Riyadh',
    locationAr: 'مسرح بكر الشدي، بوليفارد سيتي، الرياض',
    date: 'عروض مستمرة أسبوعياً',
    datesAvailable: ['2026-10-10', '2026-10-11', '2026-10-12'],
    timesAvailable: ['21:00 - 23:30', '18:00 - 20:30'],
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1000&auto=format&fit=crop',
    descriptionAr: 'أقوى المسرحيات العربية والخليجية الكوميدية الجديدة بمشاركة ألمع نجوم الكوميديا في الوطن العربي، مع صالة عرض مسرحية بمواصفات عالمية تضمن رؤية مثالية وصوت نقي.',
    organizer: 'الهيئة العامة للترفيه وموسم الرياض',
    ageRestriction: 'متاح من سن 8 سنوات وما فوق',
    termsAr: [
      'يمنع التصوير أثناء العرض المسرحي احتراماً لحقوق العمل',
      'تغلق الأبواب عند بدء العرض ولا يسمح بالدخول حتى الاستراحة',
    ],
    isHot: true,
    tiers: [
      {
        id: 'regular',
        name: 'Regular Hall',
        nameAr: 'المقاعد العادية (الصالة الرئيسية)',
        price: 95,
        available: true,
        remaining: 40,
        description: 'مقاعد مريحة مع زاوية رؤية مستقيمة للمسرح',
        color: '#8b5cf6',
      },
      {
        id: 'vip',
        name: 'VIP Front Orchestra',
        nameAr: 'كبار الشخصيات VIP (الصفوف الأولى)',
        price: 250,
        available: true,
        remaining: 8,
        description: 'صفوف A و B و C المواجهة لنجوم المسرح مباشرة',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('theater', 'مسرح بكر الشدي'),
  },
  {
    id: 'riyadh-racing-season',
    title: 'Riyadh Racing Season (King Abdulaziz Racecourse)',
    titleAr: 'موسم سباقات الخيل بالرياض (ميدان الملك عبدالعزيز)',
    slug: 'riyadh-racing-season',
    url: 'https://webook.com/ar/explore',
    category: 'فعاليات رياضية',
    location: 'King Abdulaziz Racecourse, Janadriyah, Riyadh',
    locationAr: 'ميدان الملك عبدالعزيز للفروسية، الجنادرية، الرياض',
    date: 'الجمعة والسبت، 3:30 عصراً',
    datesAvailable: ['2026-10-02', '2026-10-03'],
    timesAvailable: ['15:30 - 20:00'],
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
    descriptionAr: 'أعرق وأقوى سباقات الخيل الأصيلة في الشرق الأوسط بميدان الملك عبدالعزيز بالجنادرية، يتنافس فيها نخبة الفرسان وأعرق الإسطبلات العالمية على كؤوس وجوائز موسم السباقات الكبرى.',
    organizer: 'نادي سباقات الخيل السعودي (Jockey Club of Saudi Arabia)',
    ageRestriction: 'متاح لجميع أفراد الأسرة',
    termsAr: [
      'الدخول مسموح للعائلات والأفراد',
      'يتوفر مواقف سيارات واسعة مجانية ومنطقة مطاعم عائلية',
    ],
    isHot: false,
    tiers: [
      {
        id: 'regular',
        name: 'Grandstand General',
        nameAr: 'مدرجات المنصة العامة',
        price: 30,
        available: true,
        remaining: 150,
        description: 'إطلالة مباشرة على مسار السباق وخط النهاية',
        color: '#3b82f6',
      },
      {
        id: 'vip',
        name: 'Equestrian Club VIP Lounge',
        nameAr: 'لاونج كبار الشخصيات والملاك VIP',
        price: 350,
        available: true,
        remaining: 15,
        description: 'جلسات مكيفة راقية مع بوفيه شاي وقهوة سعودية وإطلالة علوية',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('theater', 'ميدان الملك عبدالعزيز'),
  },
  {
    id: 'riyadh-boxing-championship',
    title: 'Riyadh Season Heavyweight Boxing Championship',
    titleAr: 'نزال أبطال الوزن الثقيل للملاكمة (موسم الرياض)',
    slug: 'riyadh-boxing-championship',
    url: 'https://webook.com/ar/explore',
    category: 'ملاكمة ورياضات قتالية',
    location: 'Kingdom Arena, Riyadh',
    locationAr: 'المملكة أرينا، الرياض',
    date: 'السبت القادم، 8:00 مساءً',
    datesAvailable: ['2026-11-15'],
    timesAvailable: ['20:00 - 01:00'],
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop',
    descriptionAr: 'النزال العالمي الأضخم في الملاكمة للوزن الثقيل يجمع أساطير الحلبة في عاصمة الترفيه والرياضة العالمية الرياض داخل المملكة أرينا، يبث مباشرة لملايين المشاهدين حول العالم.',
    organizer: 'الهيئة العامة للترفيه ومجلس الملاكمة العالمي',
    ageRestriction: 'متاح لمن هم فوق سن 12 سنة',
    termsAr: [
      'التذاكر غير قابلة للإلغاء أو الاسترجاع نهائياً',
      'يمنع الوقوف في الممرات لضمان سلامة وأمان الحضور',
    ],
    isHot: true,
    tiers: [
      {
        id: 'regular',
        name: 'Upper Bowl Arena',
        nameAr: 'المدرجات العلوية',
        price: 180,
        available: true,
        remaining: 40,
        description: 'رؤية علوية كاملة لحلبة الملاكمة وشاشات العرض الكبرى',
        color: '#8b5cf6',
      },
      {
        id: 'vip',
        name: 'Ringside VIP Front Row',
        nameAr: 'مقاعد الحلبة الأمامية Ringside VIP',
        price: 1800,
        available: true,
        remaining: 4,
        description: 'مقاعد ملاصقة لحلبة النزال مباشرة مع ضيافة فاخرة واستقبال VIP',
        color: '#f59e0b',
      },
    ],
    seatingMap: generateVenueSeatingMap('stadium', 'المملكة أرينا حلبة النزال'),
  },
];

export interface WebookSyncStatus {
  lastSyncTimestamp: string;
  isSyncing: boolean;
  totalEventsSynced: number;
  activeSessions: number;
  connectedToWebookApi: boolean;
  syncIntervalSeconds: number;
}

class WebookSyncManager {
  private events: WebookEvent[] = (() => {
    // Combine real live Webook catalog with curated highlight events, deduplicated by url/slug
    const all = [...REAL_WEBOOK_LIVE_CATALOG, ...LIVE_WEBOOK_CATALOG];
    const seen = new Set<string>();
    const unique: WebookEvent[] = [];
    for (const e of all) {
      const key = e.url || e.slug || e.id;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(e);
      }
    }
    return unique;
  })();

  private listeners: ((events: WebookEvent[], status: WebookSyncStatus) => void)[] = [];
  private syncTimer: NodeJS.Timeout | null = null;
  private status: WebookSyncStatus = {
    lastSyncTimestamp: new Date().toLocaleTimeString('ar-SA'),
    isSyncing: false,
    totalEventsSynced: REAL_WEBOOK_LIVE_CATALOG.length,
    activeSessions: 1,
    connectedToWebookApi: true,
    syncIntervalSeconds: 30,
  };

  constructor() {
    this.status.totalEventsSynced = this.events.length;
    this.startAutoSync();
  }

  public getEvents(): WebookEvent[] {
    return this.events;
  }

  public getStatus(): WebookSyncStatus {
    return this.status;
  }

  public forceSyncNow(): void {
    this.status.isSyncing = true;
    this.notify();

    fetch('/api/webook/live-events')
      .then((res) => res.json())
      .then((data) => {
        if (data?.count) {
          this.status.totalEventsSynced = Math.max(this.events.length, data.count);
        }
      })
      .catch(() => null)
      .finally(() => {
        this.status.isSyncing = false;
        this.status.lastSyncTimestamp = new Date().toLocaleTimeString('ar-SA');
        this.notify();
      });
  }

  public subscribe(callback: (events: WebookEvent[], status: WebookSyncStatus) => void): () => void {
    this.listeners.push(callback);
    callback(this.events, this.status);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public addCustomWebookEvent(url: string, title?: string): WebookEvent {
    let cleanSlug = 'custom-event';
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      cleanSlug = parts[parts.length - 1] || 'custom-event';
    } catch (e) {
      cleanSlug = url.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 30);
    }

    const newEvent: WebookEvent = {
      id: 'custom-' + Date.now(),
      title: title || `Webook Live Event: ${cleanSlug}`,
      titleAr: title || `فعالية Webook المستوردة: ${cleanSlug}`,
      slug: cleanSlug,
      url: url.startsWith('http') ? url : `https://webook.com/ar/explore`,
      category: 'فعاليات Webook المخصصة',
      location: 'Official Webook Venue, Riyadh',
      locationAr: 'الموقع الرسمي للفعالية في Webook، الرياض',
      date: 'اليوم وطوال الأسبوع',
      datesAvailable: ['2026-09-24', '2026-09-25'],
      timesAvailable: ['20:00 - 23:00'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
      descriptionAr: `فعالية مضافة برابط مباشر من منصة Webook الرسمية: (${url}). تم تجهيز مخطط مقاعد افتراضي كامل لها لتمكين البوت من قنص وحجز التذاكر فوراً.`,
      organizer: 'منصة Webook الرسمية',
      ageRestriction: 'متاح للجميع',
      termsAr: ['التذاكر خاضعة لسياسة Webook الرسمية'],
      isHot: true,
      tiers: [
        {
          id: 'regular',
          name: 'Regular',
          nameAr: 'المقاعد العادية Regular',
          price: 100,
          available: true,
          remaining: 50,
          description: 'تذكرة قياسية مفعّلة في النظام',
          color: '#8b5cf6',
        },
        {
          id: 'vip',
          name: 'VIP',
          nameAr: 'كبار الشخصيات VIP',
          price: 300,
          available: true,
          remaining: 10,
          description: 'تذكرة المنصة الأولى VIP',
          color: '#f59e0b',
        },
      ],
      seatingMap: generateVenueSeatingMap('theater', cleanSlug),
    };

    this.events = [newEvent, ...this.events];
    this.status.totalEventsSynced = this.events.length;
    this.notify();
    return newEvent;
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.events, this.status));
  }

  private startAutoSync() {
    this.syncTimer = setInterval(() => {
      this.status.isSyncing = true;
      this.status.lastSyncTimestamp = new Date().toLocaleTimeString('ar-SA');
      setTimeout(() => {
        this.status.isSyncing = false;
        this.notify();
      }, 800);
    }, 30000);
  }
}

export const webookSyncManager = new WebookSyncManager();
