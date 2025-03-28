import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../UsState"
// import MultiSelect, { Option } from "@/components/MultiSelectInput";
// import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import { HelpCircle } from 'lucide-react';
import { pricingData, getEntityBasicPrice ,service_list} from '../constants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
const Section6 = () => {

  const [formData, setFormData] = useAtom(usaFormWithResetAtom);
  // const serviceList = list.map((item) => ({ label: item, value: item }));
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const state = formData.selectedState
  const entity = formData.selectedEntity
  console.log("state-->", state, entity, pricingData)

  const handleCheckboxChange = (description: string) => {
    console.log("descriptions", description)
    setSelectedServices((prev) =>
      prev.includes(description)
        ? prev.filter((item) => item !== description)
        : [...prev, description]
    )
    setFormData({ ...formData, serviceItemsSelected: selectedServices })
  };

  const price = getEntityBasicPrice(state, entity)
  // console.log("price-->", price)
  const fees = [
    {
      description: `${state} (${entity})`,
      originalPrice: `${price?.price || "N/A"}`,
      discountedPrice: `${price?.price || "N/A"}`,
      note: `${price?.note || ""}`,
      isHighlight: false,
      isOptional: false,
    },
    {
      description: `Airwallex Account opening arrangement`,
      originalPrice: `0`,
      discountedPrice: `0`,
      note: "",
      isHighlight: false,
      isOptional: false,
    },
    {
      description: `Payoneer Account opening arrangement`,
      originalPrice: `0`,
      discountedPrice: `0`,
      note: "",
      isHighlight: false,
      isOptional: false,
    },
    {
      description: `Other EMI(Digital Bank) account opening arrangement`,
      originalPrice: `400`,
      discountedPrice: `400`,
      note: "",
      isHighlight: false,
      isOptional: false,
    },
    ...service_list.map((item) => ({
      description: item,
      originalPrice: "0",
      discountedPrice: "0",
      isOptional: true,
    }))

  ]
  const totalOriginal = fees.reduce((sum, item) => sum + Number(item.originalPrice), 0);
  const totalDiscounted = fees.reduce((sum, item) => sum + Number(item.discountedPrice), 0);
  console.log("fees-->", fees)
  return (
    <React.Fragment>
      {/* <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <p>Select services provided by Mirasia</p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                        Service items you need <span className="text-red-500 flex font-bold ml-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    you can type in the empty space inside the select box to enter custom value
                                </TooltipContent>
                            </Tooltip>*
                        </span>
                    </Label>

                    {serviceList.length > 0 ? (
                        <>
                            <MultiSelect
                                options={serviceList}
                                placeholder="Select Service."
                                selectedItems={formData.serviceItemsSelected}
                                onSelectionChange={handleSelectionChange}
                            />
                        </>
                    ) : (
                        "Please Select Services"
                    )}
                </div>
            </CardContent>
        </Card> */}
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl text-cyan-400">
            Incorporation and First Year Annual Fees Details
          </CardTitle>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Service Description</TableHead>
                <TableHead className="text-right">Original Price	</TableHead>
                <TableHead className="text-right">Discounted Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee, index) => (
                <TableRow key={index} className={fee.isOptional ? "text-gray-600" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {fee.isOptional && (
                        <Checkbox
                          checked={selectedServices.includes(fee.description)}
                          onCheckedChange={() => handleCheckboxChange(fee.description)}
                        />
                      )}
                      {fee.description}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right ${fee.originalPrice !== fee.discountedPrice ? "line-through text-gray-500" : ""}`}>
                  USD {fee.originalPrice}
                  </TableCell>
                  <TableCell className={`text-right ${fee.discountedPrice === "0" ? "text-red-500 font-semibold" : ""}`}>
                    {fee.discountedPrice === "0" ? "FREE" : `USD ${fee.discountedPrice}`}
                    {/* {"note" in fee && fee.note && <span className="text-sm text-red-500 ml-1">{fee.note}</span>} */}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-gray-100">
                <TableCell>TotalCost</TableCell>
                <TableCell className="text-right line-through text-gray-500">
                  {totalOriginal}
                </TableCell>
                <TableCell className="text-right text-yellow-600">
                  {totalDiscounted}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </React.Fragment>
  )
}

export default Section6