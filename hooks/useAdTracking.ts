import { useCallback, useEffect, useRef } from 'react';
import { ManualAdPlacement, UserRole } from '../types';
import { trackAdEvent } from '../services/adTrackingService';

interface UseAdTrackingParams {
  adId: string;
  placement: ManualAdPlacement;
  context: 'exam' | 'social';
  userId?: string;
  userRole?: UserRole;
  locationHint?: string;
}

export const useAdTracking = ({
  adId,
  placement,
  context,
  userId,
  userRole,
  locationHint,
}: UseAdTrackingParams) => {
  const hasLoggedImpression = useRef(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = elementRef.current;
    if (!target) return;

    const logImpression = () => {
      if (hasLoggedImpression.current) return;
      hasLoggedImpression.current = true;
      trackAdEvent({
        adId,
        placement,
        context,
        userId,
        userRole,
        locationHint,
        type: 'impression',
      });
    };

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      logImpression();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            logImpression();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [adId, placement, context, userId, userRole, locationHint]);

  const logAdClick = useCallback(() => {
    trackAdEvent({
      adId,
      placement,
      context,
      userId,
      userRole,
      locationHint,
      type: 'click',
    });
  }, [adId, placement, context, userId, userRole, locationHint]);

  return {
    adRef: elementRef,
    logAdClick,
  };
};
