// import React, { useState, } from 'react'
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
// import { useAtom } from "jotai"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Checkbox } from '@/components/ui/checkbox'
// import { useTranslation } from 'react-i18next'
// import { toast } from '@/hooks/use-toast'
// // import { Label } from '@/components/ui/label'
// // import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
// // import { Input } from '@/components/ui/input'
// // import { HelpCircle } from 'lucide-react'
// // import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { paFormWithResetAtom } from '../PaState'

// const PaServiceSelection: React.FC = () => {
//     const { t } = useTranslation();
//     const [servicesSelection, setServicesSelection] = useState("");
//     const [selectedShareholderService, setSelectedShareholderService] = useState('');
//     const [formData, setFormData] = useAtom(paFormWithResetAtom)
//     const [selectedServices, setSelectedServices] = useState<string[]>(formData.serviceItemsSelected)


//     const optionalFees = service_list.map((service) => ({
//         id: service.id,
//         description: service.key,
//         originalPrice: 0,
//         discountedPrice: 0,
//         isHighlight: false,
//         isOptional: true,
//         isChecked: false
//     }))

//     const handleCheckboxChange = (id: string) => {
//         if (formData.sessionId != "") {
//             toast({
//                 title: "Payment Session Initiated",
//                 description: `Cant select extra items once payment session initiated`,
//             });
//         } else {
//             setSelectedServices((prev) => {
//                 const updated = prev.includes(id)
//                     ? prev.filter((item) => item !== id)
//                     : [...prev, id]
//                 setFormData({ ...formData, serviceItemsSelected: updated })
//                 return updated
//             })
//         }
//     }
//     // Combine selected optional fees with base fees
//     //   const selectedOptionalFees = optionalFees.filter((fee) =>
//     //     selectedServices.includes(fee.id)
//     //   )

//     const displayedFees = [...optionalFees.map(fee => ({
//         ...fee,
//         isChecked: selectedServices.includes(fee.id),
//     }))]

//     //   const totalOriginal = baseFees.reduce((sum, item) => sum + item.originalPrice, 0)
//     //     + selectedOptionalFees.reduce((sum, item) => sum + item.originalPrice, 0)

//     //   const totalDiscounted = baseFees.reduce((sum, item) => sum + item.discountedPrice, 0)
//     //     + selectedOptionalFees.reduce((sum, item) => sum + item.discountedPrice, 0)

//     return (

//         <Card className="w-full max-w-4xl">
//             <CardHeader className="flex flex-row justify-between items-center">
//                 <CardTitle className="text-xl text-cyan-400">
//                     {t('usa.serviceSelection.heading')}
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <Table>
//                     <TableHeader>
//                         <TableRow>
//                             <TableHead className="w-1/2">{t('usa.serviceSelection.col1')}</TableHead>
//                             <TableHead className="text-right">{t('usa.serviceSelection.col2')}</TableHead>
//                             <TableHead className="text-right">{t('usa.serviceSelection.col3')}</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {displayedFees.map((fee, index) => (
//                             <TableRow key={index} className={fee.isOptional ? "text-gray-600" : ""}>
//                                 <TableCell>
//                                     <div className="flex items-center gap-2">
//                                         {fee.isOptional && (
//                                             <Checkbox
//                                                 checked={fee.isChecked}
//                                                 onCheckedChange={() => handleCheckboxChange(fee.id)}
//                                             />
//                                         )}
//                                         {fee.description}
//                                     </div>
//                                 </TableCell>
//                                 <TableCell className={`text-right ${fee.originalPrice !== fee.discountedPrice ? "line-through text-gray-500" : ""}`}>
//                                     USD {fee.originalPrice}
//                                 </TableCell>
//                                 <TableCell className={`text-right ${fee.discountedPrice === 0 ? "text-red-500 font-semibold" : ""}`}>
//                                     {fee.discountedPrice === 0 ? t('ServiceSelection.FREE') : `USD ${fee.discountedPrice}`}
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                         <TableRow className="font-bold bg-gray-100">
//                             <TableCell>{t('usa.serviceSelection.totalCost')}</TableCell>
//                             <TableCell className="text-right line-through text-gray-500">
//                                 USD {0} {/* totalOriginal */}
//                             </TableCell>
//                             <TableCell className="text-right text-yellow-600">
//                                 USD {0} {/* totalDiscounted */}
//                             </TableCell>
//                         </TableRow>
//                     </TableBody>
//                 </Table>                
//             </CardContent>
//         </Card>

//     )
// }

// export default PaServiceSelection
