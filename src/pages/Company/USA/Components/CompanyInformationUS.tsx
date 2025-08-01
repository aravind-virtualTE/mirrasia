import { useState } from 'react';
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
// import DropdownSelect from '@/components/DropdownSelect';
import Section9 from './Section9';
import Section12 from './Section12';
import Section13 from './Section13';
import SearchSelectNew from '@/components/SearchSelect2';

const list = [
  'LLC (limited liability company)', 'Corporation', 'Consultation required before proceeding'
]

export default function CompanyInformationUS() {
  const { t } = useTranslation();
  const [formData, setFormData] = useAtom(usaFormWithResetAtom);
  const { theme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // console.log("formData.selectedState",formData.selectedState)
  const [selectedCountry, setSelectedCountry] = useState(formData.selectedState || {id : "", name : ""});
  const usaList = [
    {id : "Delaware", name: t('usa.Section2StateOptions.Delaware')},
    {id : "Wyoming", name: t('usa.Section2StateOptions.Wyoming')},
    {id : "California", name: t('usa.Section2StateOptions.California')},
    {id : "Washington", name: t('usa.Section2StateOptions.Washington')},
    {id : "New York", name: t('usa.Section2StateOptions.New York')},
    {id : "Washington D.C.", name: t('usa.Section2StateOptions.Washington D.C.')},
    {id : "State of Texas", name: t('usa.Section2StateOptions.State of Texas')},
    {id : "Nevada", name: t('usa.Section2StateOptions.Nevada')},
    {id : "Florida", name: t('usa.Section2StateOptions.Florida')},
    {id : "Georgia", name: t('usa.Section2StateOptions.Georgia')},
    // t('usa.Section2StateOptions.Other'),
  ];

  // console.log("usaNewList", usaList);
  const handleOptionChange = (value: string) => {
    setFormData({ ...formData, selectedEntity: value });
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // const handleStateOptionChange = (value: string | number) => {
  //   setFormData({ ...formData, selectedState: value });
  // };

  const handleCountrySelect = (item: { id: string; name: string }) => {
        // console.log("code", item)
        setSelectedCountry(item)
        // setFormState({...formState, selectedCountry: item});
        setFormData({ ...formData, selectedState: item });
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
                {t('usa.compInfo.infoHeading')}
                <span className="text-red-500">*</span>
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
                {t('usa.compInfo.stateSelection')}
              </h2>
            </aside>
            <div className="w-full md:w-3/4 md:ml-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="inline-flex">
                  {t('usa.Section2StateQuestion')} <span className="text-destructive">*</span>
                </Label>
              </div>

              <div className="space-y-2">
                {/* <DropdownSelect
                  options={usaList}
                  placeholder="Select..."
                  selectedValue={formData.selectedState}
                  onSelect={handleStateOptionChange}
                /> */}
                <SearchSelectNew
                  items={usaList}
                  placeholder="Select country"
                  onSelect={handleCountrySelect}
                  selectedItem={selectedCountry}
                  disabled={false}
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
              {t('usa.compInfo.corpandLlc')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mb-4">
              {t('usa.compInfo.fundamentalDiff')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] w-full pr-4">
            <CorporationVsLLC />
          </ScrollArea>
          <div className="flex justify-center mt-4">
            <Button onClick={closeDialog} className="w-full md:w-auto">{t('usa.compInfo.close')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

const CorporationVsLLC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] min-w-[150px]">{t('usa.compInfo.category')}</TableHead>
            <TableHead className="min-w-[250px]">{t('usa.compInfo.corporation')}</TableHead>
            <TableHead className="min-w-[250px]">{t('usa.compInfo.llc')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">{t('usa.compInfo.definition')}</TableCell>
            <TableCell>{t('usa.compInfo.knownAsCorpo')}
            </TableCell>
            <TableCell>
              {t('usa.compInfo.llcProprietoryPartner')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium"> {t('usa.compInfo.tax')}</TableCell>
            <TableCell>
              {t('usa.compInfo.corporateTax')}
            </TableCell>
            <TableCell>
              {t('usa.compInfo.llcIncome')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">{t('usa.compInfo.profitRealiz')}</TableCell>
            <TableCell>{t('usa.compInfo.profitDividend')}</TableCell>
            <TableCell>{t('usa.compInfo.noDividend')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">{t('usa.compInfo.retainedEarning')}</TableCell>
            <TableCell>{t('usa.compInfo.dividentTaxed')}</TableCell>
            <TableCell>{t('usa.compInfo.profitPersonalIncome')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">{t('usa.compInfo.otherConsideration')}</TableCell>
            <TableCell>{t('usa.compInfo.koreanConsideration')}</TableCell>
            <TableCell>{t('usa.compInfo.koreanLlcRule')}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">{t('usa.compInfo.spclCase')}</TableCell>
            <TableCell>{t('usa.compInfo.cryptoLegalBusiness')}</TableCell>
            <TableCell>{t('usa.compInfo.cryptoNotTaxed')}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};