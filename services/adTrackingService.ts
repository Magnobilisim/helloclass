import { ManualAdPlacement, UserRole } from '../types';

type AdEventType = 'impression' | 'click';

export interface AdTrackingEvent {
  adId: string;
  placement: ManualAdPlacement;
  context: 'exam' | 'social';
  userId?: string;
  userRole?: UserRole;
  locationHint?: string;
  type: AdEventType;
}

const STORAGE_KEY = 'hc_manual_ad_events';

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const trackAdEvent = async (event: AdTrackingEvent) => {
  const payload = {
      ...event,
      timestamp: new Date().toISOString()
  };

  if (isBrowser) {
      try {
          const historyRaw = localStorage.getItem(STORAGE_KEY);
          const history = historyRaw ? JSON.parse(historyRaw) : [];
          history.push(payload);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-100)));
      } catch (error) {
          console.warn('Failed to persist ad tracking event', error);
      }
  }

  if (typeof console !== 'undefined') {
      console.info('[MockAdTracking]', payload);
  }

  return payload;
};
