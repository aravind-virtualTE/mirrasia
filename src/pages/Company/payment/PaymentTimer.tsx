// // import React from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { Timer, AlertTriangle } from 'lucide-react';
// import { usePaymentSession } from '@/hooks/usePaymentSession';
// import { Button } from "@/components/ui/button";

// interface PaymentTimerProps {
//   sessionId: string;
// }

// export function PaymentTimer({ sessionId  }: PaymentTimerProps) {
//   const { timeLeft, status } = usePaymentSession(sessionId);

//   const formatTime = (ms: number) => {
//     const hours = Math.floor(ms / (1000 * 60 * 60));
//     const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((ms % (1000 * 60)) / 1000);

//     return {
//       hours: String(hours).padStart(2, '0'),
//       minutes: String(minutes).padStart(2, '0'),
//       seconds: String(seconds).padStart(2, '0')
//     };
//   };

//   const sendRequest = () =>{
//     console.log("req sent")
//   }
//   const time = formatTime(timeLeft);
//   // console.log("status",status)
//   if (status === 'expired') {
//     return (
//       <Card className="bg-destructive/10">
//       <CardContent className="p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <AlertTriangle className="h-6 w-6 text-destructive" />
//             <div>
//               <p className="font-medium text-destructive">Payment Session Expired</p>
//               <p className="text-sm text-destructive/80">
//                 Please contact support to create a new payment session
//               </p>
//             </div>
//           </div>
//           <Button variant="destructive" onClick={() => sendRequest()}>Contact Support</Button>
//         </div>
//       </CardContent>
//     </Card>
//     );
//   }

//   if (status === "completed") {
//     return (
//       <Card className="bg-green-100">
//         <CardContent className="p-4 flex items-center space-x-4">
//           <Timer className="h-6 w-6 text-green-600" />
//           <div>
//             <p className="font-medium text-green-600">Payment Completed</p>
//             <p className="text-sm text-green-500">Thank you for your payment!</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="bg-primary/5">
//       <CardContent className="p-4 flex items-center space-x-4">
//         <Timer className="h-6 w-6 text-primary" />
//         <div>
//           <p className="font-medium">Payment Timer</p>
//           <p className="text-sm text-muted-foreground">
//             Time remaining: {time.hours}:{time.minutes}:{time.seconds}
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, AlertTriangle } from "lucide-react";
import { usePaymentSession } from "@/hooks/usePaymentSession";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAtom } from "jotai";
import { companyIncorporationAtom } from "@/lib/atom";

interface PaymentTimerProps {
  sessionId: string;
}

export function PaymentTimer({ sessionId }: PaymentTimerProps) {
  const { timeLeft, status } = usePaymentSession(sessionId);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [formData] = useAtom(companyIncorporationAtom);
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const time = formatTime(timeLeft);

  return (
    <>
      {status === "expired" && formData.receiptUrl == "" && (
        <Card className="bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Payment Session Expired</p>
                  <p className="text-sm text-destructive/80">
                    Please contact support to create a new payment session
                  </p>
                </div>
              </div>
              <Button variant="destructive" onClick={() => setShowSupportDialog(true)}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status === "completed" && (
        <Card className="bg-green-100">
          <CardContent className="p-4 flex items-center space-x-4">
            <Timer className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-600">Payment Completed</p>
              <p className="text-sm text-green-500">Thank you for your payment!</p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* when user uploads recepit and it is under evaluation */}
      {formData.receiptUrl !== "" && status === "pending"  && (
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex items-center space-x-4">
            <Timer className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Receipt Under Evaluation</p>
              <Button variant="destructive" onClick={() => setShowSupportDialog(true)}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status !== "expired" && status !== "completed" && formData.receiptUrl == "" && (
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex items-center space-x-4">
            <Timer className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Payment Timer</p>
              <p className="text-sm text-muted-foreground">
                Time remaining: {time.hours}:{time.minutes}:{time.seconds}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Need Help? Contact Our Support Team!</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Are you experiencing issues with the incorporation procedures on our website?
              Our dedicated Help Center staff is here to assist you!
            </p>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> cs@mirrasia.com</p>
              <p><strong>Phone:</strong> (Hong Kong) +852-2187-2428 | (Korea) +82-2-543-6187</p>
              <p><strong>Kakao Talk:</strong> mirrasia</p>
              <p><strong>WeChat:</strong> mirrasia_hk</p>
              <p><strong>Kakao Channel:</strong> <a href="https://pf.kakao.com/_KxmnZT" className="text-primary underline" target="_blank" rel="noopener noreferrer">Click Here</a></p>
              <p><strong>Website:</strong> <a href="https://www.mirrasia.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">www.mirrasia.com</a></p>
            </div>
            <p className="text-sm text-muted-foreground">
              Our team is on hand during our opening hours to ensure that you have a smooth and enjoyable experience.
              Don't hesitate to reach out with any questions or concerns. We're here to help!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
