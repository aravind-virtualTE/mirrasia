import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Printer,
  RefreshCcw,
  FileText,
  User,
  Building2,
  FileSignature
} from "lucide-react";

import { ClaimsList } from './ClaimsList';
import { LetterPreview } from './LetterPreview';
import { useLetterGenerator } from './useLetterGenerator';
import { PROFESSIONAL_ROLES, RELATIONSHIP_OPTIONS, TONE_OPTIONS } from './claimSets';

/**
 * Utility to format today's date in a professional format for the letter preview.
 */
const todayPretty = () => new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date());

const ProfessionalLetterGenerator = () => {
  const {
    formData,
    updateField,
    selectedClaims,
    toggleClaim,
    generatedLetter,
    generateLetter,
    reset,
  } = useLetterGenerator();

  const companyInfo = generatedLetter
    ? `${generatedLetter.signature.company} — ${generatedLetter.signature.name}, ${generatedLetter.signature.role}`
    : '';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in no-print-bg">
      {/* Header - Hidden on print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 no-print">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Professional Reference Letter Generator
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-bold align-middle ml-2">v3.0</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm italic">
            "Your references, professionally curated."
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={reset} className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive">
            <RefreshCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            disabled={!generatedLetter}
            onClick={() => window.print()}
            className="flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT: FORM (xl:col-span-5) - Hidden on print */}
        <div className="xl:col-span-5 space-y-6 no-print">
          <Card className="border-border/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 border-b py-4">
              <div className="flex items-center gap-2 text-[#0E3A8A]">
                <User className="w-4 h-4" />
                <CardTitle className="text-xs uppercase tracking-widest font-black">1. Applicant Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="app_name">Full Name (as in Passport)</Label>
                <Input
                  id="app_name"
                  placeholder="e.g., Joo Hyun Kim"
                  value={formData.app_name}
                  onChange={(e) => updateField('app_name', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="app_dob">Date of Birth (optional)</Label>
                  <Input
                    id="app_dob"
                    placeholder="YYYY-MM-DD"
                    value={formData.app_dob}
                    onChange={(e) => updateField('app_dob', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="app_phone">Phone Number</Label>
                  <Input
                    id="app_phone"
                    placeholder="+1-555-123-4567"
                    value={formData.app_phone}
                    onChange={(e) => updateField('app_phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="app_email">Email Address</Label>
                <Input
                  id="app_email"
                  type="email"
                  placeholder="applicant@email.com"
                  value={formData.app_email}
                  onChange={(e) => updateField('app_email', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 border-b py-4">
              <div className="flex items-center gap-2 text-[#0E3A8A]">
                <Building2 className="w-4 h-4" />
                <CardTitle className="text-xs uppercase tracking-widest font-black">2. Referee Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ref_name">Referee Name</Label>
                  <Input
                    id="ref_name"
                    placeholder="e.g., Min Soo Park"
                    value={formData.ref_name}
                    onChange={(e) => updateField('ref_name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ref_role">Field & Title</Label>
                  <Select
                    value={formData.ref_role}
                    onValueChange={(val) => updateField('ref_role', val)}
                  >
                    <SelectTrigger id="ref_role">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONAL_ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ref_company">Company / Firm / Chambers</Label>
                <Input
                  id="ref_company"
                  placeholder="ABC & Partners LLC / XYZ Law Office"
                  value={formData.ref_company}
                  onChange={(e) => updateField('ref_company', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ref_relationship">Relationship</Label>
                  <Select
                    value={formData.ref_relationship}
                    onValueChange={(val) => updateField('ref_relationship', val)}
                  >
                    <SelectTrigger id="ref_relationship">
                      <SelectValue placeholder="Select relationship..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ref_site">Website (optional)</Label>
                  <Input
                    id="ref_site"
                    type="url"
                    placeholder="https://company.example"
                    value={formData.ref_site}
                    onChange={(e) => updateField('ref_site', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ref_phone">Referee Phone</Label>
                  <Input
                    id="ref_phone"
                    placeholder="+852-1234-5678"
                    value={formData.ref_phone}
                    onChange={(e) => updateField('ref_phone', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ref_email">Referee Email</Label>
                  <Input
                    id="ref_email"
                    type="email"
                    placeholder="referee@company.com"
                    value={formData.ref_email}
                    onChange={(e) => updateField('ref_email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ref_address">Company Address</Label>
                <Input
                  id="ref_address"
                  placeholder="Floor/Unit, Building, Street, City, Postcode, Country"
                  value={formData.ref_address}
                  onChange={(e) => updateField('ref_address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="years">Tenure (years)</Label>
                  <Input
                    id="years"
                    placeholder="e.g., 5"
                    value={formData.years}
                    onChange={(e) => updateField('years', e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Recommended: 2+ years</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tone">Letter Tone</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(val) => updateField('tone', val)}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="twoColumn"
                  checked={formData.twoColumn}
                  onCheckedChange={(val) => updateField('twoColumn', !!val)}
                />
                <Label
                  htmlFor="twoColumn"
                  className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Enable two-column layout for print
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 border-b py-4">
              <div className="flex items-center gap-2 text-[#0E3A8A]">
                <FileSignature className="w-4 h-4" />
                <CardTitle className="text-xs uppercase tracking-widest font-black">3. Attributes & Customization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-3">
                <Label>Select Professional Attributes</Label>
                <ClaimsList selectedClaims={selectedClaims} onToggle={toggleClaim} />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="customText">Custom Accomplishments</Label>
                <Textarea
                  id="customText"
                  placeholder="(Optional) Specific project names, metrics, or records..."
                  className="min-h-[120px] bg-muted/5 border-dashed"
                  value={formData.customText}
                  onChange={(e) => updateField('customText', e.target.value)}
                />
              </div>

              <Button
                onClick={generateLetter}
                className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
              >
                Generate Final Letter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: PREVIEW (xl:col-span-7) */}
        <div className="xl:col-span-7 sticky top-8 no-print no-print-relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0E3A8A]/60" />
              Live Preview
            </h2>
            {generatedLetter && (
              <Button size="sm" variant="outline" onClick={() => window.print()} className="flex items-center gap-2 text-[#0E3A8A] border-[#0E3A8A]/20 hover:bg-[#0E3A8A]/5">
                <Printer className="w-3.5 h-3.5" />
                Quick Print
              </Button>
            )}
          </div>

          <LetterPreview
            companyInfo={companyInfo}
            date={todayPretty()}
            opening={generatedLetter?.opening || ''}
            sections={generatedLetter?.sections || []}
            signature={generatedLetter?.signature || { name: '', role: '', company: '' }}
            twoColumn={formData.twoColumn}
            isEmpty={!generatedLetter}
          />

          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground bg-accent/10 p-4 rounded-xl border border-accent/20">
            <div className="w-2 h-2 rounded-full bg-[#0E3A8A] animate-pulse" />
            <span>
              <strong>Tip:</strong> The preview above uses a 1:1 scale. Your PDF will exactly match this formatting.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLetterGenerator;
