import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const list = [
    'LLC 유한책임회사','Corporation 법인','자문필요'
]
export default function Section2() {

    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");
  
    const handleOptionChange = (value : string) => {
      setSelectedOption(value);
      if (value !== "other") {
        setOtherText("");
      }
    };
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 3</CardTitle>
                <p>Understanding the Differences Between Corporations and LLCs</p>
            </CardHeader>
            <CorporationVsLLC />
            <CardContent className="space-y-6 pt-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name">
                    What type of US company structure would you like to establish? <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required />
                </div>

                {/* Name Change History */}
                <div className="space-y-2">
                    <RadioGroup defaultValue="no" 
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        >
                        {list.map((item) => (
                            <div className="flex items-center space-x-2" key={item}>
                                <RadioGroupItem value={item} id={item} />
                                <Label htmlFor={item} className="font-normal">
                                    {item}
                                </Label>                                
                            </div>
                        ))}                        
                    </RadioGroup>
                    {selectedOption === "other" && (
                        <Input
                            type="text"
                            placeholder="Please specify"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            className="mt-2"
                        />
                    )}
                </div>

            </CardContent>
        </Card>
    )
}


const CorporationVsLLC = () => {
  return (
    <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Category</TableHead>
          <TableHead>Corporation</TableHead>
          <TableHead>LLC (Limited Liability Company)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Definition</TableCell>
          <TableCell>
            Known as Corporation in the U.S. and Private Limited Company in the UK.
          </TableCell>
          <TableCell>
            A limited liability company, similar to a sole proprietorship or partnership (a concept not present in Korea).
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Taxation</TableCell>
          <TableCell>
            Corporate tax rates are fixed, and in countries with dividend taxes (e.g., U.S., Korea), double taxation (corporate tax + dividend tax) applies.
          </TableCell>
          <TableCell>
            In countries like the U.S., LLCs are often established to avoid double taxation. LLC income is recognized as personal income based on ownership shares, avoiding double taxation.
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Profit Realization</TableCell>
          <TableCell>
            Profits are realized through dividends.
          </TableCell>
          <TableCell>
            There is no dividend concept. Profits are recognized as personal income based on ownership shares.
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Retained Earnings</TableCell>
          <TableCell>
            In countries where dividends are taxed, profits can be retained as retained earnings for long-term asset management, generating additional income for future tax planning.
          </TableCell>
          <TableCell>
            Since profits are recognized as personal income, retained earnings cannot be set aside.
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Other Considerations</TableCell>
          <TableCell>
            For Korean residents, forming a corporation may result in double taxation (local corporate tax + Korean dividend tax). Tax planning, such as splitting dividends or reinvesting retained earnings, may be necessary.
          </TableCell>
          <TableCell>
            For Korean residents, LLC income is recognized as personal income and reported comprehensively. Local tax rates and expected profits should be reviewed.
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Special Cases (Crypto Industry)</TableCell>
          <TableCell>
            For crypto-related businesses, legal regulations and accounting standards for cryptocurrencies need to be reviewed. Some countries may tax cryptocurrencies as assets.
          </TableCell>
          <TableCell>
            In some countries, cryptocurrencies are not taxed, and they may be recognized as assets. Local tax rates and withholding taxes should be reviewed.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </CardContent>
  );
};

