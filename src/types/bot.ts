export interface Seat {
  id: string;
  row: string;
  number: number;
  label: string;
  tierId: 'vip' | 'regular' | 'cat1' | 'cat2' | 'cat3' | 'gold';
  tierNameAr: string;
  price: number;
  status: 'available' | 'reserved' | 'selected' | 'held';
  section?: string;
  x?: number;
  y?: number;
}

export interface SeatingSection {
  id: string;
  nameAr: string;
  nameEn: string;
  tierId: string;
  color: string;
  capacity: number;
  availableCount: number;
  price: number;
  rows: string[];
}

export interface SeatingMapData {
  type: 'theater' | 'stadium' | 'concert' | 'zone';
  stageLabelAr: string;
  totalSeats: number;
  availableSeats: number;
  sections: SeatingSection[];
  seats: Seat[];
}

export interface Account {
  id: string;
  email: string;
  password: string;
  name?: string;
  status: 'idle' | 'ready' | 'logging_in' | 'active' | 'success' | 'error';
  lastLog?: string;
  ticketsReserved?: number;
}

export interface TicketTier {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  available: boolean;
  remaining?: number;
  description?: string;
  color?: string;
}

export interface WebookEvent {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  url: string;
  category: string;
  location: string;
  locationAr: string;
  date: string;
  datesAvailable: string[];
  timesAvailable: string[];
  image: string;
  bannerImage?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  organizer?: string;
  ageRestriction?: string;
  termsAr?: string[];
  tiers: TicketTier[];
  isHot?: boolean;
  seatingMap: SeatingMapData;
}

export interface BotConfig {
  targetEventUrl: string;
  selectedEventId: string;
  selectedDate: string;
  selectedTime: string;
  preferredTier: string;
  ticketQuantity: number;
  maxBudget: number;
  mode: 'sniper' | 'stealth' | 'normal';
  headless: boolean;
  typingDelayMs: number;
  retryIntervalMs: number;
  autoSolveTurnstile: boolean;
  notifyTelegram: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  proxyEnabled: boolean;
  proxyUrl: string;
  keepBrowserOpenOnReserve: boolean;
}

export interface BotLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'bot';
  message: string;
  accountId?: string;
  step?: string;
}

export type BotState = 'idle' | 'running' | 'paused' | 'success' | 'failed';

export type BotStep = 
  | 'init_driver'
  | 'navigate_login'
  | 'fill_credentials'
  | 'verify_auth'
  | 'navigate_event'
  | 'select_date'
  | 'load_seating_map'
  | 'select_ticket_tier'
  | 'add_tickets'
  | 'pick_exact_seats'
  | 'click_reserve'
  | 'checkout_success'
  | 'hold_cart_success';

export interface ConfirmedBooking {
  id: string;
  referenceCode: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  seats: Seat[];
  totalPrice: number;
  paymentMethod: 'mada' | 'apple_pay' | 'visa' | 'wallet';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookedAt: string;
  gate: string;
  qrCodeData: string;
  barcode: string;
  status: 'confirmed' | 'active';
}

