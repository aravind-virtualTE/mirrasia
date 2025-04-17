import React, { useEffect, useState } from 'react'
import { getEntityBasicPrice, service_list } from '../constants'
import { useAtom } from "jotai"
import { usaFormWithResetAtom ,usaPriceAtom} from "../UsState"
// import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const InvoiceUs: React.FC = () => {
    const [formData,] = useAtom(usaFormWithResetAtom);
    const [, setUsPrice] = useAtom(usaPriceAtom)
    const [selectedServices,] = useState<string[]>(formData.serviceItemsSelected)
    const state = formData.selectedState
    const entity = formData.selectedEntity
    const price = getEntityBasicPrice(state, entity)
    // console.log("price-->", formData.serviceItemsSelected)    
    // console.log("service_list",service_list)
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
            isOptional: true,
        },
        {
            description: `Payoneer Account opening arrangement`,
            originalPrice: `0`,
            discountedPrice: `0`,
            note: "",
            isHighlight: false,
            isOptional: true,
        },
        {
            description: `Other EMI(Digital Bank) account opening arrangement`,
            originalPrice: '400',
            discountedPrice: '400',
            isHighlight: false,
            isOptional: true,
          },    
        ...service_list.map((item) => ({
            description: item,
            originalPrice: "0",
            discountedPrice: "0",
            isOptional: true,
            isHighlight: false,
        }))

    ]
    const optionalFees = [
        // {
        //   description: `Other EMI(Digital Bank) account opening arrangement`,
        //   originalPrice: 400,
        //   discountedPrice: 400,
        //   isHighlight: false,
        //   isOptional: true,
        // },
        ...service_list.map((item) => ({
          description: item,
          originalPrice: 0,
          discountedPrice: 0,
          isHighlight: false,
          isOptional: true,
        }))
      ]

    // console.log("optionalFees",optionalFees)
    const selectedOptionalFees = optionalFees.filter((fee) =>selectedServices.includes(fee.description))
    // console.log("selectedOptionalFees",selectedOptionalFees)
    const totalOriginal = fees.reduce((sum, item) => sum + Number(item.originalPrice), 0) + selectedOptionalFees.reduce((sum, item) => sum + item.originalPrice, 0);
    const totalDiscounted = fees.reduce((sum, item) => sum + Number(item.discountedPrice), 0)+ selectedOptionalFees.reduce((sum, item) => sum + item.discountedPrice, 0);

    useEffect(() => {
        setUsPrice(totalDiscounted || 0)
    }, [])
    // const currentDate = new Date().toLocaleDateString("en-US", {
    //     month: "numeric",
    //     day: "numeric",
    //     year: "numeric",
    // })
    // console.log("fees",fees)
    return (       
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL SERVICES LIMITED</CardTitle>
                    {/* <Badge variant="secondary">Generated: {currentDate}</Badge> */}
                </CardHeader>
                <CardContent>
                    {/* Invoice Items */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Original Price</TableHead>
                                <TableHead className="text-right">Discounted Price</TableHead>
                                <TableHead className="text-right">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={item.isHighlight ? "font-semibold" : ""}>{item.description}</span>
                                            {/* {item.isOptional && (
                                                <Badge variant="outline" className="text-xs">Optional</Badge>
                                            )} */}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {Number.parseFloat(item.originalPrice) > 0 ? `USD ${item.originalPrice}` : "USD 0.00"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {Number.parseFloat(item.discountedPrice) > 0 ? `USD ${item.discountedPrice}` : "USD 0.00"}
                                    </TableCell>
                                    {/* <TableCell className="text-right text-xs">
                                        {item.note && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Info size={12} className="text-blue-500" />
                                                {item.note}
                                            </div>
                                        )}
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Totals Section */}
                    <div className="mt-4 flex justify-end">
                        <Card className="w-64">
                            <CardContent className="pt-4">
                                <div className="flex justify-between mb-2">
                                    <span>Total (Original):</span>
                                    <span className="font-semibold">USD {totalOriginal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">Total (Discounted):</span>
                                    <span className="font-bold">USD {totalDiscounted.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>

    )
}

export default InvoiceUs