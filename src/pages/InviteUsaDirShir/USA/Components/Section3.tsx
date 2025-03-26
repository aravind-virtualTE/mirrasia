import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAtom } from "jotai";
import { usaFormWithResetAtom } from "../inviteUsaDirShirState";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import DropdownSelect from "@/components/DropdownSelect";

const relationshipList = [
  'shareholder',
  'Director',
  'Fiduciary',
  'Other'
];
const sourceList = [
  'Shareholder contributions or loans',
  'Business income',
  'Dividends',
  'Deposits, savings',
  'Income from real estate, stocks, and other investment assets',
  'Loan',
  'Company or equity sale proceed',
  'Inheritance funds of shareholders/directors or special officials',
  'Other'
];
const futureList = [
  'Business income',
  'Interest income',
  'Income from real estate, stocks, and other investment assets',
  'Proceeds from the sale of the company or shares held',
  'Inheritance/Gift',
  'Borrowing/consignment/deposit, etc.',
  'Other'
];


export default function Section2() {
    // const { t } = useTranslation();
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    const handleRelationshipChange = (value: string | number) => {
      setFormData({ ...formData, selectedState: value });
  };
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 3</CardTitle>
                <p>Information about the U.S. company you are setting up</p>
            </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    U.S. company name to be listed <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Relationship with U.S. companies
                    <span className="text-destructive">*</span>
                    </Label>
                </div>

                <div className="space-y-2">
                    <DropdownSelect
                        options={relationshipList}
                        placeholder="Select..."
                        selectedValue={formData.selectedState}
                        onSelect={handleRelationshipChange}
                    />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    The amount of money to invest in the U.S. company and the number of shares acquired <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Source of investment funds (multiple selections allowed) <span className="text-destructive">*</span>
                    <p>Proof of source of funds may be required in the future, so please check accordingly.</p>
                    </Label>
                </div>

                <div className="space-y-2">
                    <DropdownSelect
                        options={sourceList}
                        placeholder="Select..."
                        selectedValue={formData.selectedState}
                        onSelect={handleRelationshipChange}
                    />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Countries of inflow of funds for the above items (list all applicable countries)<span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

             <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Sources of funds that are expected to be generated or inflowed by U.S. <span className="text-destructive">*</span>
                    <p>companies in the future (multiple choices are possible)Proof of source of funds may be required in the future, so please check accordingly.</p>
                    </Label>
                </div>

                <div className="space-y-2">
                    <DropdownSelect
                        options={futureList}
                        placeholder="Select..."
                        selectedValue={formData.selectedState}
                        onSelect={handleRelationshipChange}
                    />
                </div>

            </CardContent>

                <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Countries of inflow of funds for the above items (list all applicable countries)<span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>            
                         
        </Card>
    )
}


//   return (
//     <CardContent>
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead className="w-[200px]">Category</TableHead>
//           <TableHead>Corporation</TableHead>
//           <TableHead>LLC (Limited Liability Company)</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         <TableRow>
//           <TableCell className="font-medium">Definition</TableCell>
//           <TableCell>
//             Known as Corporation in the U.S. and Private Limited Company in the UK.
//           </TableCell>
//           <TableCell>
//             A limited liability company, similar to a sole proprietorship or partnership (a concept not present in Korea).
//           </TableCell>
//         </TableRow>
//         <TableRow>
//           <TableCell className="font-medium">Taxation</TableCell>
//           <TableCell>
//             Corporate tax rates are fixed, and in countries with dividend taxes (e.g., U.S., Korea), double taxation (corporate tax + dividend tax) applies.
//           </TableCell>
//           <TableCell>
//             In countries like the U.S., LLCs are often established to avoid double taxation. LLC income is recognized as personal income based on ownership shares, avoiding double taxation.
//           </TableCell>
//         </TableRow>
//         <TableRow>
//           <TableCell className="font-medium">Profit Realization</TableCell>
//           <TableCell>
//             Profits are realized through dividends.
//           </TableCell>
//           <TableCell>
//             There is no dividend concept. Profits are recognized as personal income based on ownership shares.
//           </TableCell>
//         </TableRow>
//         <TableRow>
//           <TableCell className="font-medium">Retained Earnings</TableCell>
//           <TableCell>
//             In countries where dividends are taxed, profits can be retained as retained earnings for long-term asset management, generating additional income for future tax planning.
//           </TableCell>
//           <TableCell>
//             Since profits are recognized as personal income, retained earnings cannot be set aside.
//           </TableCell>
//         </TableRow>
//         <TableRow>
//           <TableCell className="font-medium">Other Considerations</TableCell>
//           <TableCell>
//             For Korean residents, forming a corporation may result in double taxation (local corporate tax + Korean dividend tax). Tax planning, such as splitting dividends or reinvesting retained earnings, may be necessary.
//           </TableCell>
//           <TableCell>
//             For Korean residents, LLC income is recognized as personal income and reported comprehensively. Local tax rates and expected profits should be reviewed.
//           </TableCell>
//         </TableRow>
//         <TableRow>
//           <TableCell className="font-medium">Special Cases (Crypto Industry)</TableCell>
//           <TableCell>
//             For crypto-related businesses, legal regulations and accounting standards for cryptocurrencies need to be reviewed. Some countries may tax cryptocurrencies as assets.
//           </TableCell>
//           <TableCell>
//             In some countries, cryptocurrencies are not taxed, and they may be recognized as assets. Local tax rates and withholding taxes should be reviewed.
//           </TableCell>
//         </TableRow>
//       </TableBody>
//     </Table>
//   </CardContent>
//   );
// };

