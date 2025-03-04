import { useState, useEffect, useRef } from 'react';
import { paymentApi } from '@/lib/api/payment';
import { useAtom } from 'jotai';
import { statusHkAtom } from '@/store/hkForm';

export function usePaymentSession(sessionId: string) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useAtom(statusHkAtom);
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
        // console.log("remaining", remaining);
        if (remaining >= 0) {
          interval = setInterval(() => {
            timeLeftRef.current -= 1000;
            if (timeLeftRef.current <= 0) {
              clearInterval(interval);
              setTimeLeft(0);
              if(session.status !== "completed") setStatus("expired");
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
  }, [sessionId,status]);

  return { timeLeft, status };
}

// import { useState, useEffect, useRef } from 'react';
// import { paymentApi } from '@/lib/api/payment';
// import { useAtom } from 'jotai';
// import { statusHkAtom } from '@/store/hkForm';

// export function usePaymentSession(sessionId: string) {
//   const [timeLeft, setTimeLeft] = useState<number>(0);
//   const [status, setStatus] = useAtom(statusHkAtom);
//   const timeLeftRef = useRef<number>(0);
//   const initialized = useRef(false);

//   useEffect(() => {
//     if (initialized.current) return; // Prevent re-initialization
//     initialized.current = true;

//     let interval: NodeJS.Timeout;

//     const fetchSession = async () => {
//       try {
//         const session = await paymentApi.getSession(sessionId);
//         const expiresAt = new Date(session.expiresAt).getTime();
//         const now = new Date().getTime();
//         const remaining = Math.max(0, expiresAt - now);

//         // Calculate time remaining until the end of the day
//         const endOfDay = new Date();
//         endOfDay.setHours(23, 59, 59, 999);
//         const timeUntilEndOfDay = endOfDay.getTime() - now;

//         // Use the smaller of the two times (session expiry or end of day)
//         const effectiveTimeLeft = Math.min(remaining, timeUntilEndOfDay);

//         setTimeLeft(effectiveTimeLeft);
//         timeLeftRef.current = effectiveTimeLeft;
//         setStatus(session.status);

//         if (effectiveTimeLeft >= 0) {
//           interval = setInterval(() => {
//             timeLeftRef.current -= 1000;
//             if (timeLeftRef.current <= 0) {
//               clearInterval(interval);
//               setTimeLeft(0);
//               if (session.status !== "completed") setStatus("expired");
//             } else {
//               setTimeLeft(timeLeftRef.current);
//             }
//           }, 1000);
//         }
//       } catch (error) {
//         console.error("Failed to fetch session:", error);
//       }
//     };

//     fetchSession();

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [sessionId, status]);

//   return { timeLeft, status };
// }
