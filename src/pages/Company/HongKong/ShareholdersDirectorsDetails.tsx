import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAtom } from "jotai";
import {
  regCompanyInfoAtom,
  shareHolderDirectorControllerAtom,
} from "@/lib/atom";
import { useTheme } from "@/components/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import ShareholderDirectorForm from "./ShareDirectorForm";
import { typesOfShares } from "./constants";
import { Checkbox } from "@/components/ui/checkbox";
import DropdownSelect from "@/components/DropdownSelect";
import MultiSelect, { Option } from "@/components/MultiSelectInput";
import { useTranslation } from "react-i18next";

const ShareholdersDirectorsDetails: React.FC = () => {
  const [sdcInfo, setShareDirControllerInfo] = useAtom(
    shareHolderDirectorControllerAtom
  );
  const { t } = useTranslation();
  
  const [shrDirList, setShrDirList] = useState(
    sdcInfo.shareHolders.map((item) => {
      if (item.name == "") return "Fill Shareholder/Directors and select";
      return item.name;
    })
  );

  useEffect(() => {
    setShrDirList(
      sdcInfo.shareHolders.map((item) => {
        if (item.name == "") return "Fill Shareholder/Directors and select";
        return item.name;
      })
    );
  }, [sdcInfo]);

  const [comapnyInfo, setCompanyInfo] = useAtom(regCompanyInfoAtom);
  const { theme } = useTheme();

  const handleSharesChange = (checked: boolean, purpose: string) => {
    setCompanyInfo((prev) => ({
      ...prev,
      registerShareTypeAtom: checked
        ? [...prev.registerShareTypeAtom, purpose]
        : prev.registerShareTypeAtom.filter((p) => p !== purpose),
    }));
  };

  //   const handleItemSelect = (value: string | number) => {
  //     // console.log('Selected Value:', value);
  //     setShareDirControllerInfo((prev) => ({
  //       ...prev,
  //       significantControllerAtom: value,
  //     }));
  //   };

  const handleSelect = (value: string | number) => {
    // console.log('Selected Value:', value);
    setShareDirControllerInfo((prev) => ({
      ...prev,
      designatedContactPersonAtom: value,
    }));
  };
  const handleSelectionChange = (selections: Option[]) => {
    // console.log("selections", selections)
    setShareDirControllerInfo((prev) => ({
      ...prev,
      significantControllerAtom: selections,
    }));
  };

  const shrDirArr = shrDirList.map((item) => ({ value: item, label: item }));

  // console.log("shrDirList", shrDirList);
  return (
    <div className="flex w-full p-4">
      <aside
        className={`w-1/4 p-4 rounded-md shadow-sm ${
          theme === "light"
            ? "bg-blue-50 text-gray-800"
            : "bg-gray-800 text-gray-200"
        }`}
      >
        <h2 className="text-lg font-semibold mb-2">
          ({t('CompanyInformation.shareholders')}/
          <br />
          {t('CompanyInformation.directors')}) {t('CompanyInformation.ofHKCompany')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('CompanyInformation.shHlderSubHeading')}
        </p>
      </aside>
      <div className="w-3/4 ml-4">
        <Card>
          <CardContent className="space-y-6">
            <ShareholderDirectorForm />

            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                {t('CompanyInformation.typeOfShares')}{" "}
                <span className="text-red-500 font-bold ml-1 flex">
                  *
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                      {t('CompanyInformation.typeShareInfo')}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>
              {typesOfShares.map((purpose) => (
                <div key={t(purpose)} className="flex items-start space-x-3">
                  <Checkbox
                    id={t(purpose)}
                    checked={comapnyInfo.registerShareTypeAtom.includes(
                      t(purpose)
                    )}
                    onCheckedChange={(checked) =>
                      handleSharesChange(checked as boolean, t(purpose))
                    }
                  />
                  <Label
                    htmlFor={t(purpose)}
                    className="font-normal text-sm leading-normal cursor-pointer"
                  >
                    {t(purpose)}
                  </Label>
                </div>
              ))}
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-base flex items-center font-semibold gap-2"
              >
                {t('CompanyInformation.significantController')}{" "}
                <span className="text-red-500 flex font-bold ml-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                     {t('CompanyInformation.conditionSignificantControl')}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>
              {/* {shrDirList.length > 0 ? (
                <DropdownSelect
                  options={shrDirList}
                  placeholder="Select significant Controller"
                  onSelect={handleItemSelect}
                  selectedValue={sdcInfo.significantControllerAtom}
                />
              ) : (
                "Please Fill Shareholder/Director"
              )} */}

              {shrDirList.length > 0 ? (
                <>
                
                  <MultiSelect
                    options={shrDirArr}
                    placeholder="Select Significant Controller..."
                    selectedItems={sdcInfo.significantControllerAtom}
                    onSelectionChange={handleSelectionChange}
                  />
                </>
              ) : (
                "Please Fill Shareholder/Director"
              )}
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-base font-semibold flex items-center"
              >
                {t('CompanyInformation.designatedContactPerson')}{" "}
                <span className="text-red-500 flex font-bold ml-1">
                  *
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    {t('CompanyInformation.designateToolTipInfo')}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>

              {shrDirList.length > 0 ? (
                <DropdownSelect
                  options={shrDirList}
                  placeholder="Select significant Controller"
                  onSelect={handleSelect}
                  selectedValue={sdcInfo.designatedContactPersonAtom}
                />
              ) : (
                "Please Fill Shareholder/Director"
              )}

              {/* <Input
                id="designated-Contact-Person"
                required
                className="w-full"
                value={sdcInfo.designatedContactPersonAtom}
                onChange={(e) => setShareDirControllerInfo(prev => ({ ...prev, designatedContactPersonAtom: e.target.value }))}
                placeholder="Enter Designated Contact..." /> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShareholdersDirectorsDetails;
