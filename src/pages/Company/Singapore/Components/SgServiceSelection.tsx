import React, { useState, } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { useAtom } from "jotai"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
import { toast } from '@/hooks/use-toast'
import { sgFormWithResetAtom } from '../SgState'
import { service_list } from './sgConstant'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { HelpCircle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const SgServiceSelection: React.FC = () => {
    const { t } = useTranslation();
    const [servicesSelection, setServicesSelection] = useState("");
    const [selectedShareholderService, setSelectedShareholderService] = useState('');
    const [formData, setFormData] = useAtom(sgFormWithResetAtom)
    const [selectedServices, setSelectedServices] = useState<string[]>(formData.serviceItemsSelected)


    const optionalFees = service_list.map((service) => ({
        id: service.id,
        description: service.key,
        originalPrice: service.price,
        discountedPrice: service.price,
        isHighlight: false,
        isOptional: true,
        isChecked: false
    }))

    const handleCheckboxChange = (id: string) => {
        if (formData.sessionId != "") {
            toast({
                title: "Payment Session Initiated",
                description: `Cant select extra items once payment session initiated`,
            });
        } else {
            setSelectedServices((prev) => {
                const updated = prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id]
                setFormData({ ...formData, serviceItemsSelected: updated })
                return updated
            })
        }
    }

    const displayedFees = [...optionalFees.map(fee => ({
        ...fee,
        isChecked: selectedServices.includes(fee.id),
    }))]

      const totalOriginal = displayedFees.reduce((sum, item) => sum + item.originalPrice, 0)

      const totalDiscounted = displayedFees.reduce((sum, item) => sum + item.discountedPrice, 0)

    return (

        <Card className="w-full max-w-4xl">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl text-cyan-400">
                    {t('usa.serviceSelection.heading')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/2">{t('usa.serviceSelection.col1')}</TableHead>
                            <TableHead className="text-right">{t('usa.serviceSelection.col2')}</TableHead>
                            <TableHead className="text-right">{t('usa.serviceSelection.col3')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedFees.map((fee, index) => (
                            <TableRow key={index} className={fee.isOptional ? "text-gray-600" : ""}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {fee.isOptional && (
                                            <Checkbox
                                                checked={fee.isChecked}
                                                onCheckedChange={() => handleCheckboxChange(fee.id)}
                                            />
                                        )}
                                        {fee.description}
                                    </div>
                                </TableCell>
                                <TableCell className={`text-right ${fee.originalPrice !== fee.discountedPrice ? "line-through text-gray-500" : ""}`}>
                                    USD {fee.originalPrice}
                                </TableCell>
                                <TableCell className={`text-right ${fee.discountedPrice === 0 ? "text-red-500 font-semibold" : ""}`}>
                                    {fee.discountedPrice === 0 ? t('ServiceSelection.FREE') : `USD ${fee.discountedPrice}`}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-gray-100">
                            <TableCell>{t('usa.serviceSelection.totalCost')}</TableCell>
                            <TableCell className="text-right line-through text-gray-500">
                               USD {totalOriginal}
                            </TableCell>
                            <TableCell className="text-right text-yellow-600">
                                USD {totalDiscounted} 
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className='w-full p-4'>                  
                    <div className="space-y-2">
                        <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                            Do you need a shareholder's name service?<span className="text-red-500 inline-flex">*
                            </span>
                        </Label>
                        <RadioGroup value={selectedShareholderService} onValueChange={setSelectedShareholderService} className="gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="localShareholderYes" id="shareholder-local-yes" />
                                <Label className="font-normal" htmlFor="shareholder-local-yes">Yes, the name of the local shareholder</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="offShoreCompanyYes" id="shareholder-offshore-yes" />
                                <Label className="font-normal" htmlFor="shareholder-offshore-yes">Yes, the name of an offshore company such as Virgin Islands/Seychelles/or other IBC</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="shareholder-no" />
                                <Label className="font-normal" htmlFor="shareholder-no">No</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                            Do you need a director's name service? (At least one local director must be registered.)<span className="text-red-500 inline-flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        Singapore requires at least one director to be a local resident under current law. Accordingly, we are listing local residents as directors. However, in the case of a business that falls under a high risk category, such as a financial business or cryptocurrency-related business, depending on the type of industry and business activity, the local director should individually review the availability of the service, and in this case, please confirm in advance.
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        </Label>
                        <RadioGroup value={servicesSelection} onValueChange={setServicesSelection} className="gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="services-yes" />
                                <Label className="font-normal" htmlFor="services-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="services-no" />
                                <Label className="font-normal" htmlFor="services-no">No</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-normal" htmlFor="personService">Please write the name of the person who will sign the service and appointment letter in the name of the director/shareholder.</Label>
                        <Input id='personService' placeholder="Please specify" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-normal" htmlFor="personAddress">Please write the address of the person who will sign the service and appointment letter in the name of the director/shareholder.</Label>
                        <Input id='personAddress' placeholder="Please specify" />
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}

export default SgServiceSelection
