import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function CompanyInfoForm() {
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="bg-sky-100 dark:bg-sky-900">
        <CardTitle className="text-lg font-medium">
          Information about the United States Company (LLC/Corp) to be formed
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Name of company applied for formation of a U.S. company (LLC/Corp){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="companyName" placeholder="Your answer" required />
        </div>

        {/* Relationship Selection */}
        <div className="space-y-4">
          <Label>
            Relationship with the U.S. company (LLC/Corp) you plan to establish{" "}
            <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            [Explanation of the contact person] You must delegate a designated liaison officer who will be in charge of
            the company's business liaison, and the designated liaison officer will be in charge of all main business
            liaison with the Company, and will be in charge of issuing with the company and obtaining all required
            company's confirmation of payments, and registered documents. The designated contact person can view your
            company's information and documents, as well as your company's mailing documents. The designation of a
            contact person is free of charge, and if there are more than two persons, a fee of USD 200 per person per
            year will be charged. A delegated designated contact person is designated by your company and registered
            separately with us to protect your information and reduce business confusion. (*The designated liaison
            officer must submit a letter of the person's position, contact information, and passport copy to us, and in
            the case of shareholder/officers.) **note: If you change your designated contact person, you must contact us
            immediately to update it, and you must fill out this form individually and submit the required documents.
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="shareholder" />
              <label htmlFor="shareholder">Shareholder</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="officer" />
              <label htmlFor="officer">Officer</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="principal" />
              <label htmlFor="principal">
                Principal Controller (if you directly or indirectly hold more than 25% of the shares)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="contact" />
              <label htmlFor="contact">지정연락담당자 (Designated Contact Person) *문문의 참참가능</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="partner" />
              <label htmlFor="partner">Official Partner of MiRasia</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="other" />
              <label htmlFor="other">Other</label>
            </div>
          </div>
        </div>

        {/* Share Percentage */}
        <div className="space-y-2">
          <Label htmlFor="shares">
            % of the shares you will hold in the U.S. company (LLC/Corp) you wish to establish{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="shares" placeholder="Your answer" required />
        </div>

        {/* Current Source of Funds */}
        <div className="space-y-4">
          <Label>
            Source of funds to be invested (or loaned) to a U.S. company (LLC/Corp) to be established (multiple options
            available) <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Proof of the source of funds may be required in the future, so please check accordingly.
          </p>
          <div className="space-y-2">
            {[
              "Earned Income",
              "Deposits, Savings",
              "Income from real estate, stocks, and other investment assets",
              "loan",
              "Proceeds from the sale of a company or equity",
              "Business Income / Dividends",
              "Inheritance",
              "Other",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={item.toLowerCase().replace(/\s+/g, "-")} />
                <label htmlFor={item.toLowerCase().replace(/\s+/g, "-")}>{item}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Countries of Fund Inflow */}
        <div className="space-y-2">
          <Label htmlFor="fundCountries">
            Countries of inflow of funds for the above items (all applicable countries are listed){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="fundCountries" placeholder="Your answer" required />
        </div>

        {/* Future Source of Funds */}
        <div className="space-y-4">
          <Label>
            Source of funds generated or expected to flow into the U.S. company (LLC/Corp) in the future (multiple
            options available) <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Proof of the source of funds may be required in the future, so please check accordingly.
          </p>
          <div className="space-y-2">
            {[
              "Business Income and Distribution",
              "Earned Income",
              "Interest Income",
              "Income from real estate, stocks, and other investment assets",
              "Proceeds from the sale of a company or equity",
              "Inheritance/Gift",
              "Borrowing/Consignment/Deposit, etc.",
              "Other",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={`future-${item.toLowerCase().replace(/\s+/g, "-")}`} />
                <label htmlFor={`future-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Fund Outflow Purpose */}
        <div className="space-y-4">
          <Label>
            Source of funds expected to be withdrawn/outflowed from the U.S. company (LLC/Corp) in the future (multiple
            selectable) <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Please select or describe the purpose for which the funds of the U.S. company will be paid in the future.
          </p>
          <div className="space-y-2">
            {[
              "Payment for goods",
              "Salary/Bonus Payment",
              "Lending Funds",
              "Purchase of real estate, stocks, and other investment assets",
              "Dividend Payments",
              "Payment of business operating expenses",
              "Other",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={`outflow-${item.toLowerCase().replace(/\s+/g, "-")}`} />
                <label htmlFor={`outflow-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Outflow Countries */}
        <div className="space-y-2">
          <Label htmlFor="outflowCountries">
            Countries from which funds were outflowed for the above items (all applicable countries are listed){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="outflowCountries" placeholder="Your answer" required />
        </div>
      </CardContent>
    </Card>
  )
}

