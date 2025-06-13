import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useStripe, useElements,
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement
} from "@stripe/react-stripe-js";
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { paymentApi } from '@/lib/api/payment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { useAtom, useSetAtom } from 'jotai';
import { updateCompanyIncorporationAtom } from '@/lib/atom';
import { statusHkAtom } from '@/store/hkForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CardPaymentFormProps {
  sessionId: string;
  clientSecret: string;
  amount: number;
}

const formSchema = z.object({
  email: z.string().email(),
  cardHolder: z.string().min(2),
  country: z.string().length(2),
  zipCode: z.string().min(4),
});

// Common card element styles
const cardElementStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
};

// Country data with display names and ISO codes
const countries = [
  { name: "United States", code: "US" },
  { name: "Canada", code: "CA" },
  { name: "United Kingdom", code: "GB" },
  { name: "Australia", code: "AU" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "India", code: "IN" },
  { name: "Brazil", code: "BR" },
  { name: "Hong Kong", code: "HK" },
  { name: "Singapore", code: "SG" },
];

export function CardPaymentForm({ sessionId, clientSecret, amount }: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const setStatus = useSetAtom(statusHkAtom);
  const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
  const [paymentStatus, setPaymentStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      cardHolder: "",
      country: "US", // Default to US using the country code
      zipCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setPaymentStatus({ type: null, message: '' });

    if (!stripe || !elements) {
      setPaymentStatus({
        type: 'error',
        message: 'Payment processing is not available. Please try again later.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const cardNumber = elements.getElement(CardNumberElement);
      const cardExpiry = elements.getElement(CardExpiryElement);
      const cardCvc = elements.getElement(CardCvcElement);

      if (!cardNumber || !cardExpiry || !cardCvc) {
        throw new Error("Card elements not found");
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: values.cardHolder,
            email: values.email,
            address: {
              country: values.country, // 2-letter country code
              postal_code: values.zipCode,
            }
          },
        },
      }
      );

      if (stripeError) {
        console.error(stripeError);
        const errorMessage = stripeError.message || 'Payment Failed.';
        setPaymentStatus({
          type: 'error',
          message: errorMessage
        });
        return;
      } else {
        const paymentId = paymentIntent.id
        if (paymentIntent.status === 'succeeded') {
          setStatus("completed");
          const docId = localStorage.getItem('companyRecordId');
          // Notice "US" is kept unchanged from the original code
          const sessionData = await paymentApi.updateFinalPaymentStatus(sessionId, paymentId, docId!, paymentIntent, "US");
          updateCompanyData(sessionData.updatedData);
          setPaymentStatus({
            type: 'success',
            message: 'Payment successful! Thank you for your purchase.'
          });
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

  // Get the display name for a country code
  const getCountryNameByCode = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country ? country.name : code;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 pt-4">
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

            {amount && (
              <Alert variant="default" className="bg-green-50">
                <CheckCircle className="h-4 w-4 stroke-green-600" />
                <AlertTitle className="text-green-800">Payment Amount Calculation</AlertTitle>
                <AlertDescription className="text-green-700">
                  Original Price: ${amount.toFixed(2)}
                  <br />
                  Includes a 3.5% Stripe credit card processing fee.
                  <br />
                  Final Amount Charged: ${Math.ceil(amount * 1.035)}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel htmlFor="card-number">Card information</FormLabel>
              <div className="mt-1 border rounded-md">
                <div className="p-3 border-b">
                  <CardNumberElement
                    id="card-number"
                    options={cardElementStyle}
                  />
                </div>
                <div className="flex">
                  <div className="p-3 w-1/2 border-r">
                    <CardExpiryElement
                      id="card-expiry"
                      options={cardElementStyle}
                    />
                  </div>
                  <div className="p-3 w-1/2 flex items-center">
                    <div className="flex-grow">
                      <CardCvcElement
                        id="card-cvc"
                        options={cardElementStyle}
                      />
                    </div>
                    <div className="ml-2 text-gray-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 15H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="cardHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name on card</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1">
              <FormLabel>Country or region</FormLabel>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            {getCountryNameByCode(field.value)}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="ZIP / Postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || !stripe}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              <div className="flex items-center justify-center">
                <span>Pay</span>
                <Lock className="h-4 w-4 ml-2" />
              </div>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;
const stripePromise = loadStripe(STRIPE_CLIENT_ID);

export function UsStripePaymentForm({ sessionId, clientSecret, amount }: CardPaymentFormProps) {
  const [status] = useAtom(statusHkAtom);

  const options = {
    clientSecret,
  };

  return (
    <>
      {status === "completed" && (
        <Alert variant="default" className="bg-green-50">
          <CheckCircle className="h-4 w-4 stroke-green-600" />
          <AlertTitle className="text-green-800">Payment Completed</AlertTitle>
          <AlertDescription className="text-green-700">
            Thank you for your payment!
          </AlertDescription>
        </Alert>
      )}

      {status !== "completed" && sessionId && clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CardPaymentForm sessionId={sessionId} clientSecret={clientSecret} amount={amount} />
        </Elements>
      )}
    </>
  );
}