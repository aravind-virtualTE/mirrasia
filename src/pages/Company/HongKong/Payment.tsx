import { useState } from "react"
import { BanknoteIcon as Bank, CreditCard, QrCode } from 'lucide-react'
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
// import { loadStripe } from "@stripe/stripe-js"
// import { Elements } from "@stripe/react-stripe-js"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Initialize Stripe (replace with your publishable key)
// const stripePromise = loadStripe('your_publishable_key')

export default function PaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState("card")

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Choose your preferred payment method. 100% payment required in advance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payment-methods" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          </TabsList>

          <TabsContent value="payment-methods" className="space-y-4">
            <RadioGroup
              defaultValue="card"
              onValueChange={setPaymentMethod}
              className="grid grid-cols-2 gap-4 md:grid-cols-3"
            >
              <div>
                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <CreditCard className="mb-3 h-6 w-6" />
                  Card
                  <span className="text-xs text-muted-foreground mt-1">(3.5% fee)</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="bank" id="bank" className="peer sr-only" />
                <Label
                  htmlFor="bank"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Bank className="mb-3 h-6 w-6" />
                  Bank Transfer
                </Label>
              </div>

              <div>
                <RadioGroupItem value="fps" id="fps" className="peer sr-only" />
                <Label
                  htmlFor="fps"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <QrCode className="mb-3 h-6 w-6" />
                  FPS
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "bank" && (
              <Alert>
                <AlertTitle>Bank Transfer Details</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <p><strong>Beneficiary Bank:</strong> HSBC</p>
                    <p><strong>Account No.:</strong> 817 245681 838</p>
                    <p><strong>Beneficiary Name:</strong> MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</p>
                    <p><strong>Bank Address:</strong> 1 Queen's Road, Central, Hong Kong</p>
                    <p><strong>Bank Code:</strong> 004</p>
                    <p><strong>Swift Code (HKD):</strong> HSBCHKHHHKH</p>
                    <p><strong>Swift Code (USD/Others):</strong> HSBCHKHHXXX</p>
                    <p className="text-sm text-muted-foreground mt-2">Note: All bank charges are to be borne by the remitter</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {paymentMethod === "fps" && (
              <Alert>
                <AlertTitle>Fast Payment System (FPS) Details</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <p><strong>Proxy ID:</strong> 9400086</p>
                    <p><strong>Email:</strong> biz.support@mirrasia.com</p>
                    <p><strong>Mobile:</strong> 90218363</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="First Last" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="number">Card number</Label>
                  <Input id="number" placeholder="" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="month">Expires</Label>
                    <Select>
                      <SelectTrigger id="month">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {month.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Year</Label>
                    <Select>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="CVC" />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="terms">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">1. Payment Condition</h3>
                <p>100% in advance</p>
              </div>
              
              <div>
                <h3 className="font-semibold">2. Processing Fees</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Stripe Payments: 3.5% Processing Fee</li>
                  <li>PayPal Payments: 4.5% Processing Fee</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">3. Refund Policy</h3>
                <p>All payments are NON-REFUNDABLE.</p>
              </div>

              <div>
                <h3 className="font-semibold">4. Payment Charges</h3>
                <p>The remitter bears all charges of payment, which includes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The remittance amount</li>
                  <li>Beneficiary bank's charges</li>
                  <li>All other banks' fees (intermediary bank, etc)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continue</Button>
      </CardFooter>
    </Card>
  )
}

