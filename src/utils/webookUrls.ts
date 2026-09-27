import { WebookEvent } from '../types/bot';

/**
 * Returns the 100% verified, valid Webook official event page.
 * Webook's Single Page App router requires opening the event's root page
 * (e.g. https://webook.com/ar/sa/jed/sports-event/events/slug) where the
 * user clicks "احجز التذاكر" directly in their authenticated session.
 * Direct /book subroutes or /cart routes without state trigger 404 in Webook SPA.
 */
export function getWebookBookingUrl(event?: WebookEvent | null): string {
  if (!event || !event.url) {
    return 'https://webook.com/ar/explore';
  }

  // Return the verified canonical event URL
  return event.url.trim().replace(/\/book\/?$/, '');
}

/**
 * Returns the primary official page for the event on Webook.com
 */
export function getWebookEventUrl(event?: WebookEvent | null): string {
  if (!event || !event.url) {
    return 'https://webook.com/ar/explore';
  }
  return event.url.trim().replace(/\/book\/?$/, '');
}

/**
 * Webook user bookings profile URL where all held/active bookings and past purchases are listed.
 */
export const WEBOOK_MY_BOOKINGS_URL = 'https://webook.com/ar/profile/bookings';

/**
 * Webook user tickets wallet URL
 */
export const WEBOOK_MY_TICKETS_URL = 'https://webook.com/ar/profile/tickets';

