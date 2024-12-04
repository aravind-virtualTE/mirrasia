import { useState, useEffect, useRef } from 'react';
import { paymentApi } from '@/lib/api/payment';

export function usePaymentSession(sessionId: string) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<'pending' | 'completed' | 'expired'>('pending');
  const timeLeftRef = useRef<number>(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return; // Prevent re-initialization
    initialized.current = true;

    let interval: NodeJS.Timeout;

    const fetchSession = async () => {
      try {
        const session = await paymentApi.getSession(sessionId);
        const expiresAt = new Date(session.expiresAt).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, expiresAt - now);

        setTimeLeft(remaining);
        timeLeftRef.current = remaining;
        setStatus(session.status);

        if (remaining > 0) {
          interval = setInterval(() => {
            timeLeftRef.current -= 1000;
            if (timeLeftRef.current <= 0) {
              clearInterval(interval);
              setTimeLeft(0);
              setStatus("expired");
            } else {
              setTimeLeft(timeLeftRef.current);
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };

    fetchSession();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId]);
  return { timeLeft, status };
}