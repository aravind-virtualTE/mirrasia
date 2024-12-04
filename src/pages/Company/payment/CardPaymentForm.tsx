import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CardElement, useStripe, useElements,
  Elements
} from "@stripe/react-stripe-js";
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '@/lib/api/payment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CardPaymentFormProps {
  sessionId: string;
  clientSecret: string
}

const formSchema = z.object({
  cardHolder: z.string().min(2),
});

export function CardPaymentForm({ sessionId, clientSecret }: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardHolder: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setPaymentStatus({ type: null, message: '' });
    const cardElement = elements?.getElement(CardElement);
    // console.log(values, sessionId);
    if (!stripe || !elements || !cardElement) {
      setPaymentStatus({
        type: 'error',
        message: 'Payment processing is not available. Please try again later.'
      });
      return;
    }
    setIsLoading(true)
    try {
      if (cardElement) {
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: values.cardHolder,
            },
          },
        });
        if (stripeError) {
          // Showing error to customer (e.g., insufficient funds)
          console.error(stripeError);
          let errorMessage = 'Payment failed. ';
          switch (stripeError.code) {
            case 'insufficient_funds':
              errorMessage += 'Insufficient funds in your account.';
              break;
            case 'card_declined':
              errorMessage += 'Card was declined.';
              break;
            default:
              errorMessage += stripeError.message || 'An unexpected error occurred.';
          }

          setPaymentStatus({
            type: 'error',
            message: errorMessage
          });
          return;
        }
        else {
          console.log("Payment Method:", paymentIntent);
          const paymentId = paymentIntent.id
          if (paymentIntent.status === 'succeeded') {
            console.log("paymentId", paymentId)
            const docId = localStorage.getItem('companyRecordId');
            // Send paymentMethod.id to the backend
            const sessionData = await paymentApi.updateFinalPaymentStatus(sessionId, paymentId, docId!, paymentIntent)
            console.log("sessionData", sessionData)
            setPaymentStatus({
              type: 'success',
              message: 'Payment successful! Thank you for your purchase.'
            });
          }
        }
      }
    } catch (error) {
      setPaymentStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-4">
          {paymentStatus.type === 'success' && (
              <Alert variant="default" className="bg-green-50">
                <CheckCircle className="h-4 w-4 stroke-green-600" />
                <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
                <AlertDescription className="text-green-700">
                  {paymentStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {paymentStatus.type === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Error</AlertTitle>
                <AlertDescription>
                  {paymentStatus.message}
                </AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="cardHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div style={{ marginTop: '20px' }}>
              <label>Card Details</label>
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '10px',
                }}
              >
                <CardElement
                  id="card"
                  options={{
                    hidePostalCode: true,
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': { color: '#aab7c4' },
                      },
                      invalid: { color: '#9e2146' },
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !stripe} className="w-full">Pay Now</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;
const stripePromise = loadStripe(STRIPE_CLIENT_ID);

export function StripePaymentForm({ sessionId, clientSecret }: CardPaymentFormProps) {
  const options = {
    clientSecret,

  };
  // console.log(sessionId && clientSecret)
  // console.log(sessionId, clientSecret)
  return (<>
    {sessionId && clientSecret && (<Elements stripe={stripePromise} options={options}>
      <CardPaymentForm sessionId={sessionId} clientSecret={clientSecret} />
    </Elements>)}
  </>
  );
}