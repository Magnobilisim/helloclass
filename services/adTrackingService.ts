import { ManualAdPlacement, UserRole } from '../types';

export type AdEventType = 'impression' | 'click';

export interface AdTrackingEvent {
  adId: string;
  placement: ManualAdPlacement;
  context: 'exam' | 'social';
  userId?: string;
  userRole?: UserRole;
  locationHint?: string;
  type: AdEventType;
}

export interface StoredAdTrackingEvent extends AdTrackingEvent {
  timestamp: string;
}

const STORAGE_KEY = 'hc_manual_ad_events';

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const readEventHistory = (): StoredAdTrackingEvent[] => {
  if (!isBrowser) return [];
  try {
      const historyRaw = localStorage.getItem(STORAGE_KEY);
      return historyRaw ? JSON.parse(historyRaw) : [];
  } catch (error) {
      console.warn('Failed to parse ad tracking events', error);
      return [];
  }
};

const writeEventHistory = (events: StoredAdTrackingEvent[]) => {
  if (!isBrowser) return;
  try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
      console.warn('Failed to persist ad tracking event', error);
  }
};

export const trackAdEvent = async (event: AdTrackingEvent) => {
  const payload: StoredAdTrackingEvent = {
      ...event,
      timestamp: new Date().toISOString()
  };

  if (isBrowser) {
      const history = readEventHistory();
      history.push(payload);
      writeEventHistory(history.slice(-200));
  }

  if (typeof console !== 'undefined') {
      console.info('[MockAdTracking]', payload);
  }

  return payload;
};

export const getTrackedAdEvents = (): StoredAdTrackingEvent[] => {
  return readEventHistory();
};
