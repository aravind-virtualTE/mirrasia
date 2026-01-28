import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { HelpCircle ,UploadCloud} from "lucide-react";
import { RadioGroup,RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
// Define error types
interface Errors {
  companyName: string;
  incorporationDate: string;
  settlementDate: string;
  industry: string;
  countryOfSales: string;
  salesCost: string;
  ratioCostToSales: string;
  inventory: string;
  accountsReceivable: string;
  balanceReceivable: string;
  fiscalLoans: string;
  agentContract: string;
  outsourcingRelation: string;
  cashExpenditures: string;
  transactionDetails: string;
  wagesPaid: string;
  officeExpenses: string;
  expensesIncurred: string;
  affiliatedCompanies: string;
  taxRegime: string;
  branchEstablished: string;
  accountDetails: string;
}

const AccountingTaxForm = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    incorporationDate: "",
    settlementDate: "",
    industries: [] as string[],
    countryOfSales: "",
    otherIndustry: "",
    salesCost: [] as string[],
    otherSalesCost: "",
    ratioCostToSales: "",
    inventory: "",
    accountsReceivable: "",
    balanceReceivable: "",
    fiscalLoans: "",
    agentContract: "",
    outsourcingRelation: "",
    cashExpenditures: "",
    transactionDetails: "",
    wagesPaid: "",
    officeExpenses: "",
    expensesIncurred: "",
    affiliatedCompanies: "",
    taxRegime: "",
    branchEstablished: "",
    accountDetails: "",
  });

  const [errors, setErrors] = useState<Errors>({
    companyName: "",
    incorporationDate: "",
    settlementDate: "",
    industry: "",
    countryOfSales: "",
    salesCost: "",
    ratioCostToSales: "",
    inventory: "",
    accountsReceivable: "",
    balanceReceivable: "",
    fiscalLoans: "",
    agentContract: "",
    outsourcingRelation: "",
    cashExpenditures: "",
    transactionDetails: "",
    wagesPaid: "",
    officeExpenses: "",
    expensesIncurred: "",
    affiliatedCompanies: "",
    taxRegime: "",
    branchEstablished: "",
    accountDetails: "",

  });
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {
      companyName: formData.companyName ? "" : "Company name is required.",
      incorporationDate: formData.incorporationDate
        ? ""
        : "Incorporation date is required.",
        settlementDate: formData.settlementDate
        ? ""
        : "Please select an accounting settlement date.",
      industry: formData.industries.length
        ? ""
        : "Please select at least one industry.",
      countryOfSales: formData.countryOfSales
        ? ""
        : "Please provide the country of sales.",
        salesCost: formData.salesCost.length
        ? ""
        : "Please select at least one sales cost option.",
      ratioCostToSales: formData.ratioCostToSales
        ? ""
        : "Please provide the ratio of cost to sales.",
        inventory: formData.inventory
        ? ""
        : "Please select an option for inventory on fiscal settlement.",
      accountsReceivable: formData.accountsReceivable
        ? ""
        : "Please select an option for accounts receivable.",
      balanceReceivable: formData.balanceReceivable
        ? ""
        : "Please select an option for balance of accounts receivable.",
      fiscalLoans: formData.fiscalLoans
        ? ""
        : "Please select an option for fiscal loans.",
        agentContract: formData.agentContract
        ? ""
        : "Please select an option for agent contract structure.",
      outsourcingRelation: formData.outsourcingRelation
        ? ""
        : "Please select an option for outsourcing relationships.",
      cashExpenditures: formData.cashExpenditures
        ? ""
        : "Please select an option for cash expenditures.",
        transactionDetails: formData.transactionDetails
        ? ""
        : "Please select an option for transaction details.",
      wagesPaid: formData.wagesPaid
        ? ""
        : "Please select an option for wages paid.",
      officeExpenses: formData.officeExpenses
        ? ""
        : "Please select an option for office expenses.",
        expensesIncurred: formData.expensesIncurred
        ? ""
        : "Please select an option for expenses incurred.",
      affiliatedCompanies: formData.affiliatedCompanies
        ? ""
        : "Please select an option for affiliated companies.",
      taxRegime: formData.taxRegime
        ? ""
        : "Please select an option for the tax regime.",
        branchEstablished: formData.branchEstablished
        ? ""
        : "Please select an option for branch establishment.",
      accountDetails: formData.accountDetails.trim()
        ? ""
        : "Please enter the account details.",
    };
    setErrors(newErrors);
  };

  return (
    <Card>
 
      <CardHeader>
        <CardTitle >Application for accounting / tax work</CardTitle>
        <div className="text-sm text-gray-600 space-y-1 mt-2">
          <p>Mirr Asia</p>
          <p>
            (Korea) 02-543-6187 (Hong Kong) 2187-2428 <br />
            Kakao talk: mirrasia WeChat: mirrasia_hk
          </p>
          <p>
            Website:{" "}
            <a
              href="https://www.mirrasia.com"
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              www.mirrasia.com
            </a>
          </p>
          <p>
            Plus Friend:{" "}
            <a
              href="https://pf.kakao.com/_KxmnZT"
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              https://pf.kakao.com/_KxmnZT
            </a>
          </p>
          <p>
          This application form was prepared in the form of a questionnaire about the information necessary for the company to proceed with the accounting book, accounting audit arrangement,
           and tax affairs. The questions and tax matters may be difficult for some customers or it may take some time to answer. Accordingly, we ask that you answer step-by-step when you have
            the time available and submit the relevant documents. If you have any difficulties or do not understand well in writing, please contact us at the contact information above.
          </p>
          <p>The name and photo associated with your Google account will be recorded when you upload files and submit this form. Your email is not part of your response.</p>

        </div>
        <p className="text-red-500 text-sm font-medium mt-3">
          * Indicates required question
        </p>
      </CardHeader>

 
      <CardContent className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-base font-medium">
            Company name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="Enter your company name"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            className={errors.companyName ? "border-red-500" : ""}
          />
          {errors.companyName && (
            <Alert variant="destructive">
              <AlertDescription>{errors.companyName}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Incorporation Date */}
        <div className="space-y-2">
          <Label htmlFor="incorporationDate" className="text-base font-medium">
            When is the incorporation date? <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 inline ml-2 text-gray-500 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Provide the date when your company was officially incorporated.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="incorporationDate"
            type="date"
            value={formData.incorporationDate}
            onChange={(e) =>
              setFormData({ ...formData, incorporationDate: e.target.value })
            }
            className={errors.incorporationDate ? "border-red-500" : ""}
          />
          {errors.incorporationDate && (
            <Alert variant="destructive">
              <AlertDescription>{errors.incorporationDate}</AlertDescription>
            </Alert>
          )}
        </div>
         {/* Accounting Settlement Date */}
         <div className="space-y-2">
          <Label className="text-base font-medium">
            When is the accounting settlement date?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            className="space-y-2"
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, settlementDate: value }))
            }
          >
            {["December 31", "March 31", "do not know"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
            {/* Custom Option */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Other" id="other" />
              <Label htmlFor="other">Other:</Label>
              <Input
                placeholder="Specify other date"
                className="w-full ml-2"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    settlementDate: e.target.value,
                  }))
                }
              />
            </div>
          </RadioGroup>
          {errors.settlementDate && (
            <Alert variant="destructive">
              <AlertDescription>{errors.settlementDate}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Select Industry */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Select Industry <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-1">
            {[
              "Trade",
              "Wholesale/retail distribution business",
              "Consulting",
              "Manufacturing",
              "Investment and advisory business",
              "E-commerce",
              "Online direct purchase/shipment/purchase agency",
            ].map((industry) => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox
                  id={industry}
                  checked={formData.industries.includes(industry)}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      industries: checked
                        ? [...prev.industries, industry]
                        : prev.industries.filter((i) => i !== industry),
                    }))
                  }
                />
                <Label htmlFor={industry}>{industry}</Label>
              </div>
            ))}
            {/* Custom Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="otherIndustry"
                checked={!!formData.otherIndustry}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherIndustry: checked ? formData.otherIndustry : "",
                  }))
                }
              />
              <Label htmlFor="otherIndustry">Other:</Label>
              <Input
                placeholder="Specify other industry"
                className="w-full ml-2"
                value={formData.otherIndustry}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherIndustry: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          {errors.industry && (
            <Alert variant="destructive">
              <AlertDescription>{errors.industry}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Country of Sales */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Country of sales (country of customer's location){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
            List all applicable countries
              </TooltipContent>
          </Tooltip>
        
          <Textarea
            placeholder="Enter countries where customers are located"
            value={formData.countryOfSales}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                countryOfSales: e.target.value,
              }))
            }
          />
          {errors.countryOfSales && (
            <Alert variant="destructive">
              <AlertDescription>{errors.countryOfSales}</AlertDescription>
            </Alert>
          )}
        </div>
           {/* Sales Cost */}
           <div className="space-y-2">
          <Label className="text-base font-medium">
            Sales cost <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-1">
            {[
              "Direct manufacturing",
              "Outsourcing in whole or in part",
              "Buying products wholesale and reselling them retail (business holding stock)",
              "Receive an order from a customer and deliver the entire quantity (out of stock)",
              "Outsourcing both manufacturing/product purchase and delivery as an intermediary trade business",
              "As a cross-border direct purchase business, the product ordered by the customer from the country of order is purchased from the country of manufacture and sent",
              "As a cross-border business, only delivery of products ordered by customers",
            ].map((costOption) => (
              <div key={costOption} className="flex items-center space-x-2">
                <Checkbox
                  id={costOption}
                  checked={formData.salesCost.includes(costOption)}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      salesCost: checked
                        ? [...prev.salesCost, costOption]
                        : prev.salesCost.filter((c) => c !== costOption),
                    }))
                  }
                />
                <Label htmlFor={costOption}>{costOption}</Label>
              </div>
            ))}
            {/* Custom Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="otherSalesCost"
                checked={!!formData.otherSalesCost}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherSalesCost: checked ? formData.otherSalesCost : "",
                  }))
                }
              />
              <Label htmlFor="otherSalesCost">Other:</Label>
              <Textarea
                placeholder="Specify other sales cost"
                className="w-full ml-2"
                value={formData.otherSalesCost}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otherSalesCost: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          {errors.salesCost && (
            <Alert variant="destructive">
              <AlertDescription>{errors.salesCost}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Ratio of Cost to Sales */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Ratio of cost to sales <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="Enter ratio of cost to sales"
            value={formData.ratioCostToSales}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                ratioCostToSales: e.target.value,
              }))
            }
          />
          {errors.ratioCostToSales && (
            <Alert variant="destructive">
              <AlertDescription>{errors.ratioCostToSales}</AlertDescription>
            </Alert>
          )}
        </div>
         {/* Inventory Field */}
         <div className="space-y-2">
          <Label className="text-base font-medium">
            Do you have inventory (asset) on the fiscal settlement date?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
            If you select "Yes", please send us a list of items in stock and
            amounts up to the accounting settlement date.
              </TooltipContent>
          </Tooltip>
          <RadioGroup
            value={formData.inventory}
            onValueChange={(value) => handleFieldChange("inventory", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`inventory-${option}`} />
                <Label htmlFor={`inventory-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.inventory && (
            <Alert variant="destructive">
              <AlertDescription>{errors.inventory}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Accounts Receivable */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Are there any accounts receivable (accounts not received from
            customers) on the accounting settlement date?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
            If you select "Yes", please provide a list of account receivable
            balances by company.
              </TooltipContent>
          </Tooltip>
          <RadioGroup
            value={formData.accountsReceivable}
            onValueChange={(value) =>
              handleFieldChange("accountsReceivable", value)
            }
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`accountsReceivable-${option}`}
                />
                <Label htmlFor={`accountsReceivable-${option}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.accountsReceivable && (
            <Alert variant="destructive">
              <AlertDescription>{errors.accountsReceivable}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Balance of Accounts Receivable */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Is there a balance of accounts receivable (amount that has not yet been paid to the buyer) on the accounting
            settlement date? <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
            If you select "Yes", please provide a list of account receivable
            balances by company.
              </TooltipContent>
          </Tooltip>
          <RadioGroup
            value={formData.balanceReceivable}
            onValueChange={(value) =>
              handleFieldChange("balanceReceivable", value)
            }
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`balanceReceivable-${option}`}
                />
                <Label htmlFor={`balanceReceivable-${option}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.balanceReceivable && (
            <Alert variant="destructive">
              <AlertDescription>{errors.balanceReceivable}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Fiscal Loans */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Are there any loans on the fiscal settlement date?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
            If you select "Yes", please provide the relevant loan agreement.
              </TooltipContent>
          </Tooltip>
          <RadioGroup
            value={formData.fiscalLoans}
            onValueChange={(value) => handleFieldChange("fiscalLoans", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`fiscalLoans-${option}`} />
                <Label htmlFor={`fiscalLoans-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.fiscalLoans && (
            <Alert variant="destructive">
              <AlertDescription>{errors.fiscalLoans}</AlertDescription>
            </Alert>
          )}
        </div>
         {/* Agent Contract Structure */}
         <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            In business transactions, is there a structure to pay or receive
            commissions by signing an agent contract with a third party?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Please provide the relevant contract and commission invoice if
                "Yes" is selected.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.agentContract}
            onValueChange={(value) => handleFieldChange("agentContract", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`agentContract-${option}`} />
                <Label htmlFor={`agentContract-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.agentContract && (
            <Alert variant="destructive">
              <AlertDescription>{errors.agentContract}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Outsourcing Relationship */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Does the outsourcing or outsourcing company have a relationship with
            your equity or operating rights?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Please provide the relevant contract and commission invoice if
                "Yes" is selected.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.outsourcingRelation}
            onValueChange={(value) =>
              handleFieldChange("outsourcingRelation", value)
            }
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`outsourcingRelation-${option}`}
                />
                <Label htmlFor={`outsourcingRelation-${option}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.outsourcingRelation && (
            <Alert variant="destructive">
              <AlertDescription>{errors.outsourcingRelation}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Cash Expenditures */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Are there any cash expenditures for this fiscal period?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[400px] text-sm">
                Cash expenditure is not directly paid through the corporate
                account but handled via CEO or accountants. If "Yes" is
                selected, please provide a summary of receipts and expenses.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.cashExpenditures}
            onValueChange={(value) =>
              handleFieldChange("cashExpenditures", value)
            }
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`cashExpenditures-${option}`}
                />
                <Label htmlFor={`cashExpenditures-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.cashExpenditures && (
            <Alert variant="destructive">
              <AlertDescription>{errors.cashExpenditures}</AlertDescription>
            </Alert>
          )}
        </div>
         {/* Transaction Details */}
         <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Was the amount transacted in relation to sales/purchases/expenditures
            in this fiscal period transacted by means other than bank transfer?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Provide relevant transaction details like Coin Wallet, PayPal
                transaction statements, etc.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.transactionDetails}
            onValueChange={(value) => handleFieldChange("transactionDetails", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`transactionDetails-${option}`} />
                <Label htmlFor={`transactionDetails-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.transactionDetails && (
            <Alert variant="destructive">
              <AlertDescription>{errors.transactionDetails}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Wages Paid */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Are there any wages paid to employees/executives/representatives during this fiscal period?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                If "Yes", provide employment contract, pay stub, or MPF monthly statement.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.wagesPaid}
            onValueChange={(value) => handleFieldChange("wagesPaid", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`wagesPaid-${option}`} />
                <Label htmlFor={`wagesPaid-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.wagesPaid && (
            <Alert variant="destructive">
              <AlertDescription>{errors.wagesPaid}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Office Expenses */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Was office rent and other related expenses incurred during this fiscal period?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                If "Yes", provide rental agreement and monthly invoice/receipt.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.officeExpenses}
            onValueChange={(value) => handleFieldChange("officeExpenses", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`officeExpenses-${option}`} />
                <Label htmlFor={`officeExpenses-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.officeExpenses && (
            <Alert variant="destructive">
              <AlertDescription>{errors.officeExpenses}</AlertDescription>
            </Alert>
          )}
        </div>
          {/* Expenses Incurred */}
          <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Did you incur sales/purchase/labor expenses and SG&A expenses/losses
            during the current accounting period?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Include sales/purchase invoices, expenditure receipts, and contracts.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.expensesIncurred}
            onValueChange={(value) => handleFieldChange("expensesIncurred", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`expenses-${option}`} />
                <Label htmlFor={`expenses-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.expensesIncurred && (
            <Alert variant="destructive">
              <AlertDescription>{errors.expensesIncurred}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* File Upload Instruction */}
        <div className="space-y-2 border p-4 rounded-md">
          <Label className="text-base font-medium flex items-center gap-2">
            Upload Supporting Documents
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Upload invoices, expenditure receipts, pay stubs, import/export documents, etc.
              </TooltipContent>
            </Tooltip>
          </Label>
          <Button variant="outline" className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" /> Add File
          </Button>
          <p className="text-sm text-gray-500">
            You can upload up to 10 files. If exceeded, email to{" "}
            <a href="mailto:biz.support@mirrasia.com" className="text-blue-600 underline">
              biz.support@mirrasia.com
            </a>
          </p>
        </div>

        {/* Affiliated Companies */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Does your company own interests in other companies, or do other companies have interests in your company?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Specify if affiliated companies exist and upload supporting documents.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.affiliatedCompanies}
            onValueChange={(value) => handleFieldChange("affiliatedCompanies", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`affiliated-${option}`} />
                <Label htmlFor={`affiliated-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.affiliatedCompanies && (
            <Alert variant="destructive">
              <AlertDescription>{errors.affiliatedCompanies}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tax Regime */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            If your affiliate is registered in Hong Kong, has the affiliate applied for a two-tiered profits tax regime?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[400px] text-sm">
                HOng Kong corporation two- tiered profits tax rates regime: The corporate tax rate of 8.25% is applied from the current year's 
                taxable profit to first HKS 2 million or less , and 16.5% is applied to the remaining taxable profits excluding $2 million.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.taxRegime}
            onValueChange={(value) => handleFieldChange("taxRegime", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`taxRegime-${option}`} />
                <Label htmlFor={`taxRegime-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.taxRegime && (
            <Alert variant="destructive">
              <AlertDescription>{errors.taxRegime}</AlertDescription>
            </Alert>
          )}
        </div>
           {/* Ownership & File Upload */}
           <div className="space-y-2 border p-4 rounded-md">
          <Label className="text-base font-medium">
            If your company owns 51% or more or the largest share of another company (accounting for "subsidiary"), please scan and upload the subsidiary's registered data and audit report. if your company has more than 25% to less than 50% of other companies's shares
            (major decision makers), please scan and upload the registered data and financial statements of affiliates. In addition, for affiliated companies with less than 25% stake,please scan and upload the registered data and stock certificates.
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Upload registered data, financial statements, or stock certificates of affiliates.
              </TooltipContent>
            </Tooltip>
          </Label>
          <Button variant="outline" className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" /> Add File
          </Button>
        </div>

        {/* Branch Established */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Have you established or operated a branch/subsidiary/limited partnership/contact
            office in Hong Kong or other countries after establishment or have you ever closed your buisness  after installation?
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Select "Yes" if a branch or office has been established or closed.
              </TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            value={formData.branchEstablished}
            onValueChange={(value) => handleFieldChange("branchEstablished", value)}
            className="space-y-1"
          >
            {["Yes", "No"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`branch-${option}`} />
                <Label htmlFor={`branch-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {errors.branchEstablished && (
            <Alert variant="destructive">
              <AlertDescription>{errors.branchEstablished}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* File Upload Instruction */}
        <div className="space-y-2 border p-4 rounded-md">
          <Label className="text-base font-medium">
            If you have questions about the above, upload the relevant registered data and financial statements .
          </Label>
          <Button variant="outline" className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" /> Add File
          </Button>
        </div>

        {/* Account Details */}
        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            Enter all account numbers and bank names opened in front of the corporation
            (bank account, virtual account, coin wallet, etc.)
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-1 cursor-help text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                Provide detailed account information, including virtual or digital wallets.
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            placeholder="Enter account numbers and bank names"
            value={formData.accountDetails}
            onChange={(e) => handleFieldChange("accountDetails", e.target.value)}
            className={`w-full ${errors.accountDetails ? "border-red-500" : ""}`}
          />
          {errors.accountDetails && (
            <Alert variant="destructive">
              <AlertDescription>{errors.accountDetails}</AlertDescription>
            </Alert>
          )}
        </div>
          {/* PDF Submission Section */}
          <div className="space-y-2 border p-4 rounded-md">
          <Label className="text-base font-medium">
            Submit all transaction details during the accounting period as PDF files.
          </Label>
          <p className="text-sm text-gray-600">
            Files must be in the form of an officially issued Bank Statement. Documents that
            can be modified, such as Excel, are not allowed.
          </p>
          <p className="text-sm text-gray-600">
            *Maximum file count: 10. If files exceed this limit, please send them to{" "}
            <a
              href="mailto:biz.support@mirrasia.com"
              className="text-blue-600 underline"
            >
              biz.support@mirrasia.com
            </a>
            .
          </p>
          <Button variant="outline" className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" /> Add File
          </Button>
        </div>

        {/* Additional Documents */}
        <div className="space-y-2 border p-4 rounded-md">
          <Label className="text-base font-medium">
            Please send additional documents to our email.
          </Label>
          <a
            href="mailto:biz.support@mirrasia.com"
            className="text-blue-600 underline block"
          >
            biz.support@mirrasia.com
          </a>
          <p className="text-sm text-gray-600">Thank you.</p>
        </div>

        <div className="text-center text-gray-600 text-sm">
          Never submit passwords through this form.
        </div>
        <div className="text-center text-gray-400 text-xs">
          This form was created by Mirr Asia Business Advisory & Secretarial Co. Ltd.
        </div>
  





        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={validateForm}
          >
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountingTaxForm;
