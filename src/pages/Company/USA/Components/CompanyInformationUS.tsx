import  { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { usaFormWithResetAtom } from "../UsState";
import { useTheme } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import DropdownSelect from '@/components/DropdownSelect';
import Section9 from './Section9';
import Section12 from './Section12';
import Section13 from './Section13';

const list = [
  'LLC (limited liability company)', 'Corporation', 'Consultation required before proceeding'
]

export default function CompanyInformationUS() {
  const { t } = useTranslation();
  const [formData, setFormData] = useAtom(usaFormWithResetAtom);
  const { theme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const usaList = [
    t('usa.Section2StateOptions.Delaware'),
    t('usa.Section2StateOptions.Wyoming'),
    t('usa.Section2StateOptions.California'),
    t('usa.Section2StateOptions.New York'),
    t('usa.Section2StateOptions.Washington D.C.'),
    t('usa.Section2StateOptions.State of Texas'),
    t('usa.Section2StateOptions.Nevada'),
    t('usa.Section2StateOptions.Florida'),
    t('usa.Section2StateOptions.Georgia'),
    t('usa.Section2StateOptions.Other'),
  ];
  const handleOptionChange = (value: string) => {
    setFormData({ ...formData, selectedEntity: value });
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleStateOptionChange = (value: string | number) => {
    setFormData({ ...formData, selectedState: value });
};

  return (
    <>
      <Card>
        <CardContent>
          <div className='flex flex-col md:flex-row w-full p-4'>
            <aside
              className={`w-full md:w-1/4 p-4 rounded-md shadow-sm mb-4 md:mb-0 ${theme === "light"
                ? "bg-blue-50 text-gray-800"
                : "bg-gray-800 text-gray-200"
                }`}
            >
              <h2
                className="text-m font-semibold mb-0 cursor-pointer underline"
                onClick={openDialog}
              >
                Differences Between Corporations and LLCs<span className="text-red-500">*</span>
              </h2>
            </aside>
            <div className="w-full md:w-3/4 md:ml-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('usa.usCompanyEntity')}  <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="space-y-2">
                <Select onValueChange={handleOptionChange} value={formData.selectedEntity}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {list.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className='flex flex-col md:flex-row w-full p-4'>
            <aside
              className={`w-full md:w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                ? "bg-blue-50 text-gray-800"
                : "bg-gray-800 text-gray-200"
                }`}
            >
              <h2 className="text-m font-semibold mb-0">
                State Selection
              </h2>
            </aside>
            <div className="w-full md:w-3/4 md:ml-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="inline-flex">
                  {t('usa.Section2StateQuestion')} <span className="text-destructive">*</span>
                </Label>
              </div>

              <div className="space-y-2">
                <DropdownSelect
                  options={usaList}
                  placeholder="Select..."
                  selectedValue={formData.selectedState}
                  onSelect={handleStateOptionChange}
                />
              </div>
            </div>
          </div>
          <Section9 />
          <Section12 />
          <Section13 />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[70%] w-full mx-auto my-auto p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold mb-2">
              Corporation vs LLC: Key Differences
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mb-4">
              Understand the fundamental differences between Corporations and Limited Liability Companies
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] w-full pr-4">
            <CorporationVsLLC />
          </ScrollArea>
          <div className="flex justify-center mt-4">
            <Button onClick={closeDialog} className="w-full md:w-auto">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

const CorporationVsLLC = () => {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] min-w-[150px]">Category</TableHead>
            <TableHead className="min-w-[250px]">Corporation</TableHead>
            <TableHead className="min-w-[250px]">LLC (Limited Liability Company)</TableHead>
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
    </div>
  );
};