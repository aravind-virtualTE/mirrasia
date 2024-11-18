import { useTheme } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { companyBusinessInfoAtom, regCompanyInfoAtom } from "@/lib/atom";
import { useAtom } from "jotai";
import { HelpCircle } from "lucide-react";


const CompanyInformation = () => {

    const [businessInfo, setBusinessInfo] = useAtom(companyBusinessInfoAtom);
    const [comapnyInfo, setCompanyInfo] = useAtom(regCompanyInfoAtom);

    const industries = [
        "Trade",
        "Wholesale/retail distribution business",
        "Consulting",
        "Manufacturing",
        "Investment and advisory business",
        "E-commerce",
        "Online direct purchase/shipment/purchase agency",
        "IT and software development",
        "Cryptocurrency related business(ICO exchange, wallet service etc.)",
        "Real Estate Investment/Development",
        "Government related business",
        "Development/transaction/trade of energy/natural resource/commodity",
        "TPA"
    ];

    const purposeOptions = [
        "Entering business in Hong Kong and Greater China",
        "Asset management by investing in real estate or financial assets",
        "Managing through investing in a subsidiary or affiliated company as a holding company",
        "Investor or business counterparty proposed you to establish a Singapore company",
        "Geographical benefits for international transactions",
        "Pursuing diversification of business due to relaxed regulations",
        "Pursuit of Competitive Advantage through relaxed financial regulations",
        "Increase transactional volume due to low tax rate and non-transactional tax (Non-VAT)",
        "Pursuit of investment profit due to No Capital Gain Tax",
        // "기타"
    ];

    const typesOfShares = [
        "Oridnary shares",
        "Preference Share (pre-advice may be required)",
    ];

    const paymentOptions = [
        "Payment amount of the share capital will be deposited to the bank account after opening the corporate account",
        "Payment amount of the share capital will be made in cash, and it will be held as petty cash in the company and used for expenses when incurred",
        'Other'
    ];

    const amountOptions = ["1", "100", "1,000", "10,000"]

    const currencyOptions = ["HKD", "USD", "CNY", "Other"];

    const noOfSharesOptions = [
        'Total capital divided by $1 (par value per share = $1; general convention to issue the share in HK)',
        '1 share (as least 1 share to be issued) (1 share price = total capital)',
        '100 shares',
        '1,000 shares',
        '10,000 shares',
        'Others'
    ]

    const sharePercentageList = [
        '100% owned by a holding company', '100% owned by one individual', '100% owned by two or more individuals', '100% owned by companies and individuals', 'Other'
    ]

    const directorOptions = ['1 natural person', '2 or more natural persons', 'Company(s) (a nominee can participate in the decision-making of the Hong Kong company) and natural person(s)', 'Other']

    const addressOptions = ["Use of Mirr Asia's address service", "I/We have a commercial address to register in Hong Kong (Mirr Asia's address service is not needed)", "Other"]

    const handleIndustryChange = (business_industry: string) => {
        setBusinessInfo((prev) => ({ ...prev, business_industry }));
    };

    const handleDescriptionChange = (business_product_description: string) => {
        setBusinessInfo((prev) => ({ ...prev, business_product_description }));
    };

    const handlePurposeChange = (business_purpose: string) => {
        setBusinessInfo((prev) => ({ ...prev, business_purpose }));
    };

    const handleShareTypeChange = (registerShareTypeAtom: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerShareTypeAtom }));
    };


    const handlePaymentOptionChange = (registerPaymentShare: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerPaymentShare }));
    };
    const handleCurrencyOptionChange = (registerCurrencyAtom: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerCurrencyAtom }));
    };

    const handleShareCapitalOptionChange = (registerAmountAtom: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerAmountAtom }));
    };



    const handleNumShareIssueOptionChange = (registerNumSharesAtom: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerNumSharesAtom }));
    };
    const handleNumShareHolderOptionChange = (registerShareholdersAtom: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerShareholdersAtom }));
    };
    const handleNumDirectorOptionChange = (registerDirectorAtom: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerDirectorAtom }));
    };


    const handleAddressCompanyOptionChange = (registerAddressAtom: string) => {
        setCompanyInfo((prev) => ({ ...prev, registerAddressAtom }));
    };
    const { theme } = useTheme();
    return (
        <>
            <div className="flex w-full p-4">
                <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                    ? 'bg-blue-50 text-gray-800'
                    : 'bg-gray-800 text-gray-200'
                    }`}>
                    <h2 className="text-lg font-semibold mb-2">Business Information of the Hong Kong company</h2>
                    <p className="text-sm text-gray-500">In this section please provide information of the Hong Kong Company and related business to be established</p>
                </aside>
                <div className="w-3/4 ml-4">
                    <Card>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-base font-semibold">Select Industry <span className="text-red-500 font-bold ml-1">*</span></Label>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={businessInfo.business_industry}
                                    onValueChange={handleIndustryChange}
                                >
                                    {industries.map((industry) => (
                                        <div key={industry} className="flex items-center space-x-3">
                                            <RadioGroupItem value={industry} id={industry} />
                                            <Label htmlFor={industry} className="font-normal">
                                                {industry}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">
                                    Description of the product name, product type, service content, service type, etc. to be transacted after incorporation <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    className="h-32"
                                    placeholder="Enter description..."
                                    value={businessInfo.business_product_description}
                                    onChange={(e) => handleDescriptionChange(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">
                                    Purpose of the establishment of the Hong Kong company and expected effects <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={businessInfo.business_purpose}
                                    onValueChange={handlePurposeChange}
                                >
                                    {purposeOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex w-full p-4">
                <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                    ? 'bg-blue-50 text-gray-800'
                    : 'bg-gray-800 text-gray-200'
                    }`}>
                    <h2 className="text-lg font-semibold mb-2">Registration details of the Hong Kong company</h2>
                    <p className="text-sm text-gray-500">In this section, please provide information on the shares, shareholders, and directors to be filed in the Hong Kong company.</p>
                </aside>
                <div className="w-3/4 ml-4">
                    <Card>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-base font-semibold">Name of the Hong Kong company you wish to register <span className="text-red-500 font-bold ml-1">* <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        The company name must be in English as a minimum requirement, and can also be in Chinese(traditional Chinese only; simplified Chinese is not allowed). However, a combination of English and Chinese (except for English abbreviations such as HK) is not allowed, and must be written as Limited in full at the end of the English name, and must be written as 有限公司 at the end of the Chinese name. The company name can be a combination of uppercase letters/lowercase letters/numbers/periods/commas/parentheses, and other special characters are not allowed. International can be abbreviated as Int'l. The company name cannot be registered if there is a company previously registered under the same or similar company name. Accordingly, if you enter the three different company names you wish to register in the order of 1st / 2nd / 3rd preference, we will check the names and register in the order of your preferences.
                                    </TooltipContent>
                                </Tooltip>
                                </span>
                                </Label>
                                {/* <p className="text-sm text-gray-500">The company name must be in English as a minimum requirement, and can also be in Chinese(traditional Chinese only; simplified Chinese is not allowed). However, a combination of English and Chinese (except for English abbreviations such as HK) is not allowed, and must be written as Limited in full at the end of the English name, and must be written as 有限公司 at the end of the Chinese name. The company name can be a combination of uppercase letters/lowercase letters/numbers/periods/commas/parentheses, and other special characters are not allowed. International can be abbreviated as Int'l. The company name cannot be registered if there is a company previously registered under the same or similar company name. Accordingly, if you enter the three different company names you wish to register in the order of 1st / 2nd / 3rd preference, we will check the names and register in the order of your preferences.</p> */}
                                <Input
                                    id="comapany-reg-name"
                                    required
                                    className="w-full"
                                    value={comapnyInfo.registerCompanyNameAtom}
                                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, registerCompanyNameAtom: e.target.value }))}
                                    placeholder="Enter company name..." />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">
                                    Type of share(s) to be issued <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <p className="text-sm text-gray-500">In the case of issuing preference shares or corporate bonds, pre-advice may be required before proceeding, such as reviewing articles of associations and legal regulations.</p>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerShareTypeAtom}
                                    onValueChange={handleShareTypeChange}
                                >
                                    {typesOfShares.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div>
                                <Label className="text-base font-semibold">
                                    Payment of the share capital <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <p className="text-sm text-gray-500">Hong Kong is subject to the New Companies Ordinance (Cap. 622) revised as of March 3, 2014, so all share capitals are payable in full. As Hong Kong does not have a separate capital account like other countries, you can deposit the share capital amount after opening a corporate account. If the opening of a corporate account is delayed or there is no corporate account, the director(or a person in charge of your company's cash) can keep the capital amount and use it for the company's expenditures (as a petty cash account), and submit supporting documents of the expenditures such as expense receipts and etc. However, this is the capital payment method based on Hong Kong, and procedures and reporting obligations under the Foreign Direct Investment and Foreign Exchange Transaction Act in other countries must be separately checked and processed. In some countries, you may report the foreign direct investment through your foreign exchange bank or through the relevant government department.</p>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerPaymentShare}
                                    onValueChange={handlePaymentOptionChange}
                                >
                                    {paymentOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">
                                    The base currency of the share capital <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <p className="text-sm text-gray-500">It is recommended that the currency of the share capital be the same as the functional currency to be used for accounting purposes. For example, if you trade both purchases and sales in USD, setting the share capital in USD is convenient for accounting. If this is not the case, all currencies of translations must be converted to the base currency for accounting. Please note that the currency of the share capital cannot be changed to another currency after the incorporation.  (Example: Share Capital issued in HKD cannot be changed to USD)</p>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerCurrencyAtom}
                                    onValueChange={handleCurrencyOptionChange}
                                >
                                    {currencyOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div>
                                <Label className="text-base font-semibold">
                                    The total amount of the share capital to be paid <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <p className="text-sm text-gray-500">This is the amount according to the above base currency. Example) USD 1,000</p>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerAmountAtom}
                                    onValueChange={handleShareCapitalOptionChange}
                                >
                                    {amountOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div>
                                <Label className="text-base font-semibold">
                                    Total number of shares to be issued (at least 1 share) <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <p className="text-sm text-gray-500">After establishment, capital increases such as the issuance of new shares and transfer of shares incur additional expenses, so please carefully determine the number of shares and amount of capital. If you plan to transfer shares in the future, it is recommended that the number of shares is efficient enough in order to divide the shares according to the desired ratio. For example, issuing 10 shares at the time of incorporation, but if you want to transfer 33.33% of the total shares to another partner, the process will become complicated as it required to issue additional shares to match the proportion you wish to divide. In addition, if you wish to have a difference (eg HKD5) on the par value per share to the future investor after issuing the par value per share as HKD1 at the time of incorporation, it is recommended to consider this before you decide to issue the shares.</p>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerNumSharesAtom}
                                    onValueChange={handleNumShareIssueOptionChange}
                                >
                                    {noOfSharesOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">
                                    Shareholders of the Hong Kong company <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>

                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerShareholdersAtom}
                                    onValueChange={handleNumShareHolderOptionChange}
                                >
                                    {sharePercentageList.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">Please enter the shareholder's name and the number of shares to be assigned. <span className="text-red-500 font-bold ml-1">*</span></Label>
                                <Input
                                    id="shareholder's name"
                                    required
                                    className="w-full"
                                    value={comapnyInfo.registerShareholderNameAtom}
                                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, registerShareholderNameAtom: e.target.value }))}
                                    placeholder="Enter shareholder name & number..." />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">
                                    Directors of the Hong Kong company <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <p className="text-sm text-gray-500">In the Hong Kong company, other companies can also be registered as directors, and when the board of directors makes a decision, a representative delegated by the company can participate in decision making. In this case, you must provide the documents of the board resolution and power of attorney prepared by the company. (it is not recommended for small companies or companies that do not have an expert to handle these procedures due to the complicated documentary process). Under Cap.622 Companies Ordinance, a Hong Kong company must have at least one natural person as a director.</p>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerDirectorAtom}
                                    onValueChange={handleNumDirectorOptionChange}
                                >
                                    {directorOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div>
                                <Label className="text-base font-semibold">
                                    Address of the Hong Kong company to be registered <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <p className="text-sm text-gray-500">A Hong Kong company must have the commercial address in Hong Kong. We provide the address service for registration, and this service includes registered address and mail handling service. (The address of a residence or accommodation cannot be registered as a company address.)</p>
                                <RadioGroup className="mt-4 space-y-3"
                                    value={comapnyInfo.registerAddressAtom}
                                    onValueChange={handleAddressCompanyOptionChange}
                                >
                                    {addressOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </>
    );
};

export default CompanyInformation;
