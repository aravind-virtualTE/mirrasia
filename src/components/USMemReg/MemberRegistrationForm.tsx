import  { useState} from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function MemberRegistrationForm() {
    const [date, setDate] = useState<Date>()
  
    return (
      <Card className="max-w-5xl mx-auto mt-2">
        <CardHeader className="bg-sky-100 dark:bg-sky-900">
          <CardTitle className="text-lg font-medium">Individual Member Registration</CardTitle>
          <p className="text-sm text-muted-foreground">This section is for individual membership registration.</p>
        </CardHeader>
  
        <CardContent className="space-y-6 pt-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="Your answer" required />
          </div>
  
          {/* Name Change History */}
          <div className="space-y-2">
            <Label>
              Have you ever changed your name? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup defaultValue="no">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="font-normal">
                  Yes (Please write your name before changing your name in the Other column below.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="font-normal">
                  no
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">
                  Other:
                </Label>
              </div>
            </RadioGroup>
          </div>
  
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label>
              date of birth <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd-MM-yyyy") : "dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
  
          {/* Place of Birth */}
          <div className="space-y-2">
            <Label htmlFor="birthplace">
              place of birth <span className="text-destructive">*</span>
            </Label>
            <Input id="birthplace" placeholder="Your answer" required />
          </div>
  
          {/* Nationality */}
          <div className="space-y-2">
            <Label htmlFor="nationality">
              nationality <span className="text-destructive">*</span>
            </Label>
            <Input id="nationality" placeholder="Your answer" required />
          </div>
  
          {/* Passport Number */}
          <div className="space-y-2">
            <Label htmlFor="passport">
              Passport number <span className="text-destructive">*</span>
            </Label>
            <Input id="passport" placeholder="Your answer" required />
          </div>
  
          {/* Residential Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Residential address and period of residence <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Please also include your zip code and how long you have lived in your country.
            </p>
            <Textarea id="address" placeholder="Your answer" className="min-h-[100px]" required />
          </div>
  
          {/* Mailing Address */}
          <div className="space-y-2">
            <Label htmlFor="mailing">Mailing address (if different from your residential address)</Label>
            <Textarea id="mailing" placeholder="Your answer" className="min-h-[100px]" />
          </div>
  
          {/* Mobile Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              A mobile phone number where you can be contacted <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              We will send you an official communication regarding your primary contact. Therefore, please be sure to
              include a phone number that can be received. (If your contact information changes, you will only be
              contacted until the new contact is officially updated, so you should be very careful about entering and
              updating your contact information.)
            </p>
            <Input id="phone" placeholder="Your answer" type="tel" required />
          </div>
  
          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">
              E-mail address <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              We will send you an official communication regarding your primary contact via this email. Therefore, please
              be sure to include an email address that you can check regularly. (If your contact information changes, you
              will only be contacted until the new contact is officially updated, so you should be very careful about
              entering and updating your contact information.)
            </p>
            <Input id="email" placeholder="Your answer" type="email" required />
          </div>
  
          {/* KakaoTalk ID */}
          <div className="space-y-2">
            <Label htmlFor="kakao">KakaoTalk ID (if any)</Label>
            <Input id="kakao" placeholder="Your answer" />
          </div>
  
          {/* Other SNS */}
          <div className="space-y-2">
            <Label htmlFor="sns">Telegram, WeChat, and other SNS IDs (if any)</Label>
            <Input id="sns" placeholder="Your answer" />
          </div>
        </CardContent>
      </Card>
    )
}