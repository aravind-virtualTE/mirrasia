import React from 'react'
import { getEntityBasicPrice, service_list } from '../constants'
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../UsState"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Info } from 'lucide-react'
// import { InfoIcon as InfoCircle } from "lucide-react"

const InvoiceUs: React.FC = () => {
    const [formData,] = useAtom(usaFormWithResetAtom);

    const state = formData.selectedState
    const entity = formData.selectedEntity
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
            isHighlight: false, // Provide a default value for isHighlight
        }))

    ]
    const totalOriginal = fees.reduce((sum, item) => sum + Number(item.originalPrice), 0);
    const totalDiscounted = fees.reduce((sum, item) => sum + Number(item.discountedPrice), 0);
    const currentDate = new Date().toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
    })
    return (
        // <div className="container mx-auto py-8 px-4">
        //     <Card className="border rounded-md shadow-sm overflow-hidden">
        //         <div className="p-6">
        //             <div className="flex justify-between items-start mb-8">
        //                 <h1 className="text-xl font-bold">GLOBAL BUSINESS ADVISORY & SECRETARIAL SERVICES LIMITED</h1>
        //                 <div className="text-sm text-gray-600">Generated: {currentDate}</div>
        //             </div>

        //             <div className="overflow-x-auto">
        //                 <table className="w-full border-collapse">
        //                     <thead>
        //                         <tr className="border-b">
        //                             <th className="py-3 px-4 text-left font-medium text-gray-700 w-1/2">Description</th>
        //                             <th className="py-3 px-4 text-right font-medium text-gray-700">
        //                                 Original
        //                                 <br />
        //                                 Price
        //                             </th>
        //                             <th className="py-3 px-4 text-right font-medium text-gray-700">
        //                                 Discounted
        //                                 <br />
        //                                 Price
        //                             </th>
        //                             <th className="py-3 px-4 text-right font-medium text-gray-700">Notes</th>
        //                         </tr>
        //                     </thead>
        //                     <tbody>
        //                         {fees.map((item, index) => (
        //                             <tr key={index} className="border-b hover:bg-gray-50">
        //                                 <td className="py-4 px-4 align-top">
        //                                     <div className="flex items-start gap-2">
        //                                         <span className={`${item.isHighlight ? "font-semibold" : ""}`}>{item.description}</span>
        //                                         {item.isOptional && (
        //                                             <Badge variant="outline" className="ml-2 text-xs">
        //                                                 Optional
        //                                             </Badge>
        //                                         )}
        //                                     </div>
        //                                 </td>
        //                                 <td className="py-4 px-4 text-right align-top text-gray-700">
        //                                     {Number.parseFloat(item.originalPrice) > 0 ? `USD ${item.originalPrice}` : "USD 0.00"}
        //                                 </td>
        //                                 <td className="py-4 px-4 text-right align-top font-medium">
        //                                     {Number.parseFloat(item.discountedPrice) > 0 ? `USD ${item.discountedPrice}` : "USD 0.00"}
        //                                 </td>
        //                                 {/* <td className="py-4 px-4 text-right align-top">
        //                                     {item.note && (
        //                                         <div className="flex justify-end items-center">
        //                                             <InfoCircle className="h-4 w-4 text-blue-500" />
        //                                             <span className="ml-1 text-sm text-gray-600">{item.note}</span>
        //                                         </div>
        //                                     )}
        //                                 </td> */}
        //                             </tr>
        //                         ))}
        //                     </tbody>
        //                 </table>
        //             </div>

        //             <div className="mt-8 flex justify-end">
        //                 <div className="w-full max-w-xs">
        //                     <div className="border rounded-md p-4 bg-gray-50">
        //                         <div className="flex justify-between items-center mb-2">
        //                             <span className="font-medium">Total (Original):</span>
        //                             <span className="font-bold">USD {totalOriginal.toFixed(2)}</span>
        //                         </div>
        //                         <div className="flex justify-between items-center text-green-600">
        //                             <span className="font-medium">Total (Discounted):</span>
        //                             <span className="font-bold text-lg">USD {totalDiscounted.toFixed(2)}</span>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     </Card>
        // </div>
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>GLOBAL BUSINESS ADVISORY & SECRETARIAL SERVICES LIMITED</CardTitle>
                    <Badge variant="secondary">Generated: {currentDate}</Badge>
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
                                            {item.isOptional && (
                                                <Badge variant="outline" className="text-xs">Optional</Badge>
                                            )}
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