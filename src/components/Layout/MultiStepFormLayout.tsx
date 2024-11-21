import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
// import Navbar from './Navbar';

const MultiStepFormLayout:React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Company Details', component: <CompanyDetailsForm /> },
    { title: 'Director Information', component: <DirectorForm /> },
    { title: 'Business Activity', component: <BusinessForm /> },
    { title: 'Address Details', component: <AddressForm /> }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 z-50 w-full border-b bg-background">
        <div className="container flex items-center justify-between h-14">
          test
        </div>
      </header>

      {/* Main container with top padding for header */}
      <div className="flex pt-14 flex-1">
        {/* Left Sidebar */}
        <Card className="w-64 rounded-none border-r border-t-0 border-l-0 border-b-0">
          <div className="p-4">
            <div className="space-y-2">
              {steps.map((step, index) => (
                <Button
                  key={index}
                  variant={currentStep === index ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    currentStep === index && "bg-secondary"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  {step.title}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <Card className="rounded-none border-b border-t-0 border-l-0 border-r-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Company Incorporation</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </CardHeader>
          </Card>

          {/* Scrollable Form Area */}
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto p-6">
              {steps[currentStep].component}
            </div>
          </ScrollArea>

          {/* Bottom Navigation */}
          <Card className="rounded-none border-t border-b-0 border-l-0 border-r-0">
            <CardContent className="flex justify-between p-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="w-64 rounded-none border-l border-t-0 border-r-0 border-b-0">{/* Right Progress Indicator */}
          <div className="p-4">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                      index < currentStep && "bg-primary/20 text-primary",
                      index === currentStep && "bg-primary text-primary-foreground",
                      index > currentStep && "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-3 text-sm">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Placeholder form components using shadcn/ui
const CompanyDetailsForm:React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Company Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input id="company-name" placeholder="Enter company name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-type">Company Type</Label>
        <Select>
          <SelectTrigger id="company-type">
            <SelectValue placeholder="Select company type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private Limited Company</SelectItem>
            <SelectItem value="public">Public Limited Company</SelectItem>
            <SelectItem value="llp">Limited Liability Partnership</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>    
  </Card>
);

const DirectorForm:React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Director Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="director-name">Full Name</Label>
        <Input id="director-name" placeholder="Enter full name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="director-email">Email</Label>
        <Input id="director-email" type="email" placeholder="Enter email address" />
      </div>
    </CardContent>
  </Card>
);

const BusinessForm:React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Business Activity</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="business-activity">Main Business Activity</Label>
        <Textarea
          id="business-activity"
          placeholder="Describe your main business activity"
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry Sector</Label>
        <Select>
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select industry sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="services">Services</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

const AddressForm:React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Address Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Registered Address</Label>
        <Input id="address" placeholder="Enter registered address" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" placeholder="Enter city" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select>
          <SelectTrigger id="country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

export default MultiStepFormLayout;