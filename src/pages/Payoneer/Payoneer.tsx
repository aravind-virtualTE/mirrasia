import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, CreditCard, Shield, Zap, Store, Headphones, CheckCircle2, ArrowRight, Building2 } from "lucide-react";

type UseCaseKey = "startups" | "ecommerce" | "agencies";

const steps = [
  {
    icon: Building2,
    title: "Company Formation",
    desc: "Incorporate overseas entity in HK, UAE, USA, or SG",
  },
  {
    icon: CreditCard,
    title: "Payoneer Setup",
    desc: "Account aligned with your entity structure",
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    desc: "KYC, AML, and operational alignment",
  }
];

const useCases: Record<UseCaseKey, { title: string; desc: string; icon: React.ElementType }> = {
  startups: {
    title: "For Startups",
    desc: "Receive international client payments with multi-currency accounts and competitive FX rates.",
    icon: Zap,
  },
  ecommerce: {
    title: "For E-commerce",
    desc: "Collect marketplace payouts from Amazon, Shopify, eBay, and more with unified dashboard.",
    icon: Store,
  },
  agencies: {
    title: "For Agencies",
    desc: "Invoice global clients, manage multi-currency FX, and streamline cross-border payouts.",
    icon: Headphones,
  },
};

const features = [
  { icon: Globe, label: "Multi-currency accounts" },
  { icon: CreditCard, label: "Low FX conversion" },
  { icon: Shield, label: "Compliance support" },
  { icon: Zap, label: "Fast payouts" },
  { icon: Store, label: "Marketplace integrations" },
  { icon: CheckCircle2, label: "Dedicated advisory" },
];

export default function PayoneerMirrAsiaIntegration(): JSX.Element {
  const [activeTab, setActiveTab] = useState<UseCaseKey>("startups");

  return (
    <section className="py-8">
      <div className="max-width mx-auto px-3 md:px-4">
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="pb-4 text-center bg-muted/30">            
            <CardTitle className="text-2xl">Payoneer + Mirr Asia</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Global payment enablement paired with compliant company formation
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Steps Flow */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative rounded-lg border bg-card p-3 text-center group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-2">
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Step {index + 1}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium leading-tight mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/20 p-3 text-center"
                >
                  <feature.icon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-medium leading-tight">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Use Cases */}
            <Card className="border-dashed shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {(Object.keys(useCases) as UseCaseKey[]).map((key) => (
                    <Button
                      key={key}
                      variant={activeTab === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(key)}
                      className="capitalize text-xs h-8"
                    >
                      {key}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = useCases[activeTab].icon;
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{useCases[activeTab].title}</h4>
                    <p className="text-xs text-muted-foreground">{useCases[activeTab].desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center pt-2">
              <Button className="gap-2">
                Book Free Consultation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
