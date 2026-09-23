import { WebookEvent, Seat } from '../types/bot';

// Helper to generate theater seats
function generateTheaterSeats(): Seat[] {
  const seats: Seat[] = [];
  
  // Rows A to D (VIP - 150 SAR)
  ['A', 'B', 'C', 'D'].forEach((row, rIdx) => {
    for (let num = 1; num <= 14; num++) {
      // Simulate some already reserved seats by other users
      const isReserved = (rIdx === 0 && (num === 5 || num === 6 || num === 7)) ||
                         (rIdx === 1 && (num === 2 || num === 3 || num === 11)) ||
                         (rIdx === 2 && num % 3 === 0);
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
        x: (num - 1) * 28 + (num > 7 ? 20 : 0), // center aisle
        y: rIdx * 28,
      });
    }
  });

  // Rows E to K (Regular - 85 SAR)
  ['E', 'F', 'G', 'H', 'J', 'K'].forEach((row, rIdx) => {
    for (let num = 1; num <= 18; num++) {
      const isReserved = (rIdx % 2 === 0 && num % 4 === 0) || (num === 9 || num === 10);
      seats.push({
        id: `seat-${row}-${num}`,
        row,
        number: num,
        label: `${row}${num}`,
        tierId: 'regular',
        tierNameAr: 'العادية Regular',
        price: 85,
        status: isReserved ? 'reserved' : 'available',
        section: 'Main Hall',
        x: (num - 1) * 24 + (num > 9 ? 16 : 0),
        y: 130 + rIdx * 26,
      });
    }
  });

  return seats;
}

// Helper to generate stadium seats
function generateStadiumSeats(): Seat[] {
  const seats: Seat[] = [];

  // West Stand (VIP - 1200 SAR)
  ['W1', 'W2'].forEach((row, rIdx) => {
    for (let num = 1; num <= 16; num++) {
      const isReserved = num <= 4;
      seats.push({
        id: `seat-vip-${row}-${num}`,
        row,
        number: num,
        label: `${row}-${num}`,
        tierId: 'vip',
        tierNameAr: 'المنصة الملكية VIP',
        price: 1200,
        status: isReserved ? 'reserved' : 'available',
        section: 'West VIP Stand',
        x: num * 24,
        y: rIdx * 26,
      });
    }
  });

  // East Stand (Cat 1 - 350 SAR)
  ['E1', 'E2', 'E3'].forEach((row, rIdx) => {
    for (let num = 1; num <= 16; num++) {
      const isReserved = num % 3 === 0;
      seats.push({
        id: `seat-cat1-${row}-${num}`,
        row,
        number: num,
        label: `${row}-${num}`,
        tierId: 'cat1',
        tierNameAr: 'الدرجة الأولى Cat 1',
        price: 350,
        status: isReserved ? 'reserved' : 'available',
        section: 'East Main Stand',
        x: num * 24,
        y: 80 + rIdx * 26,
      });
    }
  });

  // North/South Stands (Cat 3 - 120 SAR)
  ['N1', 'N2'].forEach((row, rIdx) => {
    for (let num = 1; num <= 14; num++) {
      const isReserved = num > 10;
      seats.push({
        id: `seat-cat3-${row}-${num}`,
        row,
        number: num,
        label: `${row}-${num}`,
        tierId: 'cat3',
        tierNameAr: 'الدرجة الثالثة (خلف المرمى)',
        price: 120,
        status: isReserved ? 'reserved' : 'available',
        section: 'Behind Goal',
        x: num * 24,
        y: 180 + rIdx * 26,
      });
    }
  });

  return seats;
}

export const PRESET_EVENTS: WebookEvent[] = [
  {
    id: 'egy-comedy-night-110898',
    title: 'Comedy Pod - The Egyptians Night',
    titleAr: 'كوميديا مصرية - كوميدي بود',
    slug: 'egy-comedy-night-110898',
    url: 'https://webook.com/ar/events/egy-comedy-night-110898',
    category: 'Comedy & Theater',
    location: 'Theater 1, Boulevard City, Riyadh',
    locationAr: 'مسرح ١، بوليفارد رياض سيتي، الرياض',
    date: '7 ديسمبر 2024',
    datesAvailable: ['2024-12-07', '2024-12-08'],
    timesAvailable: ['21:30 - 23:00', '19:00 - 20:30'],
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&auto=format&fit=crop',
    isHot: true,
    tiers: [
      {
        id: 'regular',
        name: 'Regular',
        nameAr: 'العادية (Regular)',
        price: 85,
        available: true,
        remaining: 24,
        description: 'مقاعد الدخول العادي - رؤية واضحة ومسرح مكيف',
        color: '#8b5cf6'
      },
      {
        id: 'vip',
        name: 'VIP',
        nameAr: 'كبار الشخصيات (VIP)',
        price: 150,
        available: true,
        remaining: 8,
        description: 'صفوف أمامية مميزة مع ضيافة مجانية ودخول سريع',
        color: '#f59e0b'
      }
    ],
    seatingMap: {
      type: 'theater',
      stageLabelAr: 'خشبة المسرح (THE STAGE)',
      totalSeats: 164,
      availableSeats: 118,
      sections: [
        {
          id: 'vip-section',
          nameAr: 'منطقة كبار الشخصيات (صفوف A إلى D)',
          nameEn: 'VIP Front Stage',
          tierId: 'vip',
          color: '#f59e0b',
          capacity: 56,
          availableCount: 38,
          price: 150,
          rows: ['A', 'B', 'C', 'D']
        },
        {
          id: 'regular-section',
          nameAr: 'المدرج الرئيسي العادي (صفوف E إلى K)',
          nameEn: 'Regular Main Hall',
          tierId: 'regular',
          color: '#8b5cf6',
          capacity: 108,
          availableCount: 80,
          price: 85,
          rows: ['E', 'F', 'G', 'H', 'J', 'K']
        }
      ],
      seats: generateTheaterSeats(),
    }
  },
  {
    id: 'derby-riyadh-alhilal-alnassr',
    title: 'Riyadh Derby: Al Hilal vs Al Nassr',
    titleAr: 'ديربي الرياض: الهلال ضد النصر',
    slug: 'derby-riyadh-alhilal-alnassr',
    url: 'https://webook.com/ar/events/derby-riyadh-alhilal-alnassr',
    category: 'Sports',
    location: 'Kingdom Arena, Riyadh',
    locationAr: 'المملكة أرينا، الرياض',
    date: '15 يناير 2025',
    datesAvailable: ['2025-01-15'],
    timesAvailable: ['20:00 - 22:30'],
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    isHot: true,
    tiers: [
      {
        id: 'cat_general',
        name: 'Category 3 (General)',
        nameAr: 'الدرجة الثالثة (عامة)',
        price: 120,
        available: true,
        remaining: 12,
        description: 'مدرجات خلف المرمى',
        color: '#3b82f6'
      },
      {
        id: 'cat_cat1',
        name: 'Category 1 (Premium)',
        nameAr: 'الدرجة الأولى (ممتازة)',
        price: 350,
        available: true,
        remaining: 5,
        description: 'واجهة الملعب الرئيسية',
        color: '#10b981'
      },
      {
        id: 'vip_lounge',
        name: 'VIP Lounge',
        nameAr: 'منصة كبار الشخصيات',
        price: 1200,
        available: true,
        remaining: 2,
        description: 'ضيافة فندقية 5 نجوم وبوفيه مفتوح',
        color: '#f59e0b'
      }
    ],
    seatingMap: {
      type: 'stadium',
      stageLabelAr: 'أرضية الملعب (العشب الأخضر - PITCH)',
      totalSeats: 108,
      availableSeats: 72,
      sections: [
        {
          id: 'vip-stand',
          nameAr: 'المنصة الملكية VIP',
          nameEn: 'West Royal Lounge',
          tierId: 'vip',
          color: '#f59e0b',
          capacity: 32,
          availableCount: 22,
          price: 1200,
          rows: ['W1', 'W2']
        },
        {
          id: 'cat1-stand',
          nameAr: 'الدرجة الأولى (الواجهة الشرقية)',
          nameEn: 'East Main Stand',
          tierId: 'cat1',
          color: '#10b981',
          capacity: 48,
          availableCount: 32,
          price: 350,
          rows: ['E1', 'E2', 'E3']
        },
        {
          id: 'cat3-stand',
          nameAr: 'الدرجة الثالثة (خلف المرمى)',
          nameEn: 'Behind Goals',
          tierId: 'cat3',
          color: '#3b82f6',
          capacity: 28,
          availableCount: 18,
          price: 1200,
          rows: ['N1', 'N2']
        }
      ],
      seats: generateStadiumSeats(),
    }
  },
  {
    id: 'boulevard-world-entry-pass',
    title: 'Boulevard World Entry Pass',
    titleAr: 'تذاكر دخول بوليفارد وورلد',
    slug: 'boulevard-world-entry-pass',
    url: 'https://webook.com/ar/events/boulevard-world-entry-pass',
    category: 'Entertainment & Zones',
    location: 'Boulevard World, Riyadh',
    locationAr: 'بوليفارد وورلد، الرياض',
    date: 'مفتوح يومياً',
    datesAvailable: ['2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13'],
    timesAvailable: ['16:00 - 01:00'],
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
    isHot: false,
    tiers: [
      {
        id: 'regular',
        name: 'Standard Ticket',
        nameAr: 'تذكرة قياسية',
        price: 50,
        available: true,
        remaining: 150,
        description: 'دخول كافة المناطق العامة والمناطق الثقافية',
        color: '#6366f1'
      },
      {
        id: 'gold_fast',
        name: 'Fast Track Pass',
        nameAr: 'مسار سريع ذهبي',
        price: 175,
        available: true,
        remaining: 40,
        description: 'دخول سريع لجميع الألعاب والوجهات بدون انتظار',
        color: '#eab308'
      }
    ],
    seatingMap: {
      type: 'zone',
      stageLabelAr: 'البوابة الرئيسية والبحيرة (MAIN LAGOON)',
      totalSeats: 100,
      availableSeats: 85,
      sections: [
        {
          id: 'zones-general',
          nameAr: 'المناطق الدولية العامة',
          nameEn: 'General World Pavilions',
          tierId: 'regular',
          color: '#6366f1',
          capacity: 60,
          availableCount: 50,
          price: 50,
          rows: ['A', 'B', 'C']
        },
        {
          id: 'fast-track',
          nameAr: 'المسار السريع VIP',
          nameEn: 'Fast Track Access',
          tierId: 'gold_fast',
          color: '#eab308',
          capacity: 40,
          availableCount: 35,
          price: 175,
          rows: ['FT1', 'FT2']
        }
      ],
      seats: generateTheaterSeats(),
    }
  }
];
