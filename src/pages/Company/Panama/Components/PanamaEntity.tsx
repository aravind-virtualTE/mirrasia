import { useTheme } from '@/components/theme-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAtom } from 'jotai';
import React from 'react'
import { paFormWithResetAtom } from '../PaState';
import { t } from 'i18next';

const PanamaEntity: React.FC <{canEdit: boolean}> = ({ canEdit }) => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(paFormWithResetAtom)

    const entityOptions = [{ id: 'Yes', value: t('AmlCdd.options.yes') },
    { id: 'No', value: t('AmlCdd.options.no') }, { id: 'Other', value: t('InformationIncorporation.paymentOption_other') }]

    // console.log("formData",formData)

    const handlePanamaEntity = (value: string) => {
        const selectedItem = entityOptions.find(item => (item.value) == (value));
        setFormData({ ...formData, panamaEntity: selectedItem || { id: '', value: "" } })
    }
    return (
        <div className='flex w-full p-4'>
            <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                ? "bg-blue-50 text-gray-800"
                : "bg-gray-800 text-gray-200"
                }`}>
                <h2 className="text-m font-semibold mb-0">{t("panama.relPanamaEntity")}</h2>
            </aside>
            <div className="w-3/4 ml-4">
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                       {t("panama.panamaEntity")}
                        <span className="text-red-500 inline-flex">*</span>
                    </Label>
                    <RadioGroup value={formData.panamaEntity.value} onValueChange={(e) => handlePanamaEntity(e)} className="gap-4" disabled={!canEdit}>
                        {entityOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                    {option.value}
                                </Label>
                            </div>
                        ))}
                        {formData.panamaEntity.value === "other" && (
                            <Input placeholder="Please specify" value={formData.otherPanamaEntity} onChange={(e) => setFormData({ ...formData, otherPanamaEntity: e.target.value })} />
                        )}
                    </RadioGroup>
                </div>
                {formData.panamaEntity.id === 'yes' && <div className="space-y-2">
                    <Label htmlFor="entity" className="inline-flex">
                        {t("panama.descPanamaEntity")} <span className="text-red-500 font-bold ml-1 flex">*</span>
                    </Label>
                    <Input id="entity" placeholder="Descibe entity" className="w-full" value={formData.pEntityInfo} onChange={(e) => setFormData({ ...formData, pEntityInfo: e.target.value })} disabled={!canEdit} />
                </div>}
            </div>
        </div>
    )
}

export default PanamaEntity