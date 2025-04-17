import React, { useState, } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../UsState"
import {  getEntityBasicPrice, service_list } from '../constants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

const UsServiceSelection:React.FC = () => {
  const [formData, setFormData] = useAtom(usaFormWithResetAtom)
  const [selectedServices, setSelectedServices] = useState<string[]>(formData.serviceItemsSelected)
  const state = formData.selectedState
  const entity = formData.selectedEntity
  const basePriceData = getEntityBasicPrice(state, entity)

  const baseFees = [
    {
      description: `${state} (${entity})`,
      originalPrice: Number(basePriceData?.price || 0),
      discountedPrice: Number(basePriceData?.price || 0),
      note: `${basePriceData?.note || ""}`,
      isHighlight: false,
      isOptional: false,
    },
    // {
    //   description: `Airwallex Account opening arrangement`,
    //   originalPrice: 0,
    //   discountedPrice: 0,
    //   note: "",
    //   isHighlight: false,
    //   isOptional: true,
    // },
    // {
    //   description: `Payoneer Account opening arrangement`,
    //   originalPrice: 0,
    //   discountedPrice: 0,
    //   note: "",
    //   isHighlight: false,
    //   isOptional: true,
    // },
  ]

  const optionalFees = [   
    ...service_list.map((item) => ({
      description: item,
      originalPrice: item === "Other EMI(Digital Bank) account opening arrangement" ? 400 : 0,
      discountedPrice: item === "Other EMI(Digital Bank) account opening arrangement" ? 400 : 0,
      isHighlight: false,
      isOptional: true,
    }))
  ]

  const handleCheckboxChange = (description: string) => {
    setSelectedServices((prev) => {
      const updated = prev.includes(description)
        ? prev.filter((item) => item !== description)
        : [...prev, description]
      // Update the atom only after computing updated state
      setFormData({ ...formData, serviceItemsSelected: updated })
      return updated
    })
  }

  // Combine selected optional fees with base fees
  const selectedOptionalFees = optionalFees.filter((fee) =>
    selectedServices.includes(fee.description)
  )

  const displayedFees = [...baseFees, ...optionalFees.map(fee => ({
    ...fee,
    isChecked: selectedServices.includes(fee.description)
  }))]

  const totalOriginal = baseFees.reduce((sum, item) => sum + item.originalPrice, 0)
    + selectedOptionalFees.reduce((sum, item) => sum + item.originalPrice, 0)

  const totalDiscounted = baseFees.reduce((sum, item) => sum + item.discountedPrice, 0)
    + selectedOptionalFees.reduce((sum, item) => sum + item.discountedPrice, 0)

  return (
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
              <TableHead className="text-right">Original Price</TableHead>
              <TableHead className="text-right">Discounted Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedFees.map((fee, index) => (
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
                <TableCell className={`text-right ${fee.discountedPrice === 0 ? "text-red-500 font-semibold" : ""}`}>
                  {fee.discountedPrice === 0 ? "FREE" : `USD ${fee.discountedPrice}`}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-gray-100">
              <TableCell>Total Cost</TableCell>
              <TableCell className="text-right line-through text-gray-500">
                USD {totalOriginal}
              </TableCell>
              <TableCell className="text-right text-yellow-600">
                USD {totalDiscounted}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default UsServiceSelection
