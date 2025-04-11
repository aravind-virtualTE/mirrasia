import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQs() {
  const faqs = [
    {
      question: "What do I need to register a company with your service?",
      answer:
        "All you need are a few basic details about your business, such as your preferred company name, business activity, and shareholder information. Our platform guides you step-by-step and takes care of the rest.",
    },
    {
      question: "How long does the company registration process take?",
      answer:
        "Most companies can be registered within a few business days, depending on the jurisdiction. Our process is fast, online, with no long queues or confusing forms.",
    },
    {
      question: "Can you help me choose the right type of business entity?",
      answer:
        "Yes! Our experts can help you select the most suitable business structure based on your goals, industry, and location — whether it's an LLC, corporation, or another entity type.",
    },
    {
      question: "What's included in the accounting and tax services?",
      answer:
        "Our accounting plans include bookkeeping, payroll, tax filing, and real-time financial reporting. We'll also help ensure your business remains compliant with local regulations.",
    },
    {
      question: "Can I get support after my company is registered?",
      answer:
        "Absolutely! We offer ongoing support, including corporate secretary services, compliance monitoring, and reminders for key deadlines and filings — so you're never on your own.",
    },
    {
      question: "What if I already have a company? Can I still use your services?",
      answer:
        "Yes! If your business is already set up, we can streamline your operations with our accounting, tax, and compliance services — allowing you to focus on growing your business.",
    },
    {
      question: "Is your service suitable for small businesses and startups?",
      answer:
        "Our solutions are designed for businesses of all sizes, with affordable plans that scale with your needs. Startups especially benefit from our easy setup and expert support.",
    },
    {
      question: "How do I get started?",
      answer:
        "Click the 'Get Started' button, fill out a short form, and we'll guide you through the rest. It only takes a few minutes to begin your business journey with us!",
    },
    {
      question: "Is everything done online?",
      answer:
        "The entire process — from company registration to accounting management — is done online. You can access your documents, reports, and support anytime, from anywhere.",
    },
    {
      question: "Will I get official documents after registration?",
      answer:
        "Yes, once your company is successfully registered, you'll receive all official incorporation documents, including your certificate of incorporation and any other relevant government filings.",
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-8xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>            
          </CardContent>
        </Card>
      </div>
    </section>
  );
}