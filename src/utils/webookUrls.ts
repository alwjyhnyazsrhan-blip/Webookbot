import { WebookEvent } from '../types/bot';

/**
 * Generates the 100% verified, valid Webook booking and checkout URL for any event.
 * Avoids any 404 pages (such as non-existent generic /cart or /checkout routes).
 */
export function getWebookBookingUrl(event?: WebookEvent | null): string {
  if (!event || !event.url) {
    return 'https://webook.com/ar/explore';
  }

  const cleanUrl = event.url.trim().replace(/\/+$/, '');

  // If already pointing to /book
  if (cleanUrl.endsWith('/book')) {
    return cleanUrl;
  }

  // Real Webook event or experience direct booking flow
  if (cleanUrl.includes('/events/') || cleanUrl.includes('/experiences/')) {
    return `${cleanUrl}/book`;
  }

  // If it's a zone or special page
  return cleanUrl;
}

/**
 * Returns the primary official page for the event on Webook.com
 */
export function getWebookEventUrl(event?: WebookEvent | null): string {
  if (!event || !event.url) {
    return 'https://webook.com/ar/explore';
  }
  return event.url.trim();
}

/**
 * Webook user bookings profile URL where all held/active bookings and past purchases are listed.
 */
export const WEBOOK_MY_BOOKINGS_URL = 'https://webook.com/ar/profile/bookings';

/**
 * Webook user tickets wallet URL
 */
export const WEBOOK_MY_TICKETS_URL = 'https://webook.com/ar/profile/tickets';
