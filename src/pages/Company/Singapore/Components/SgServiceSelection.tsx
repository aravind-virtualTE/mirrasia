import React, { useState, } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { useAtom } from "jotai"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { sgFormWithResetAtom } from '../SgState'
import { service_list } from './sgConstant'
import { t } from 'i18next';

const SgServiceSelection: React.FC = () => {
    const [formData, setFormData] = useAtom(sgFormWithResetAtom)
    const [selectedServices, setSelectedServices] = useState<string[]>(formData.serviceItemsSelected)

    const addressList = formData.businessAddress
    const shareholderList = formData.shareHolders
    const directorsList = formData.directors
    let serviceFees = service_list.map((service) => ({
        id: service.id,
        description: t(service.key),
        originalPrice: service.price,
        discountedPrice: service.price,
        isOptional: service.isOptional,
        isChecked: false
    }))

    if (addressList && addressList.id === "mirrasiaAddress") {
        serviceFees = [
            ...serviceFees,
            {
                id: "registeredBusinessAddress",
                description: t("Singapore.regBsnsService"),
                originalPrice: 350,
                discountedPrice: 350,
                isOptional: false,
                isChecked: false,
            },
        ];
    }

      const legalEntityYesCount = shareholderList.filter((item: { legalEntity: { id: string } }) => item.legalEntity?.id === "Yes").length + directorsList.filter((item) => item.legalEntity?.id === "Yes").length;

    if (legalEntityYesCount > 0) {
        serviceFees = [
            ...serviceFees,
            {
                id: "corporateSecretaryAnnualService",
                description: `${t("Singapore.crpSecAnnualServ")} (${legalEntityYesCount})`,
                originalPrice: legalEntityYesCount * 550.0,
                discountedPrice: legalEntityYesCount * 550.0,
                isOptional: false,
                isChecked: false,
            },
        ];
    }
    if(formData.onlineAccountingSoftware?.value === "yes") {
        serviceFees = [
            ...serviceFees,
            {
                id: "onlineAccountingSoftware",
                description: t("Singapore.accPackageSixMonths"),
                originalPrice: 2000.00,
                discountedPrice: 2000.00,
                isOptional: false,
                isChecked: false,
            },
        ];
    }

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

    const displayedFees = [...serviceFees.map(fee => ({
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
            </CardContent>
        </Card>

    )
}

export default SgServiceSelection
