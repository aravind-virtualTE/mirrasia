import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import React, { useState } from 'react'

const PanamaEntity: React.FC = () => {
    const { theme } = useTheme();
    const [servicesSelection, setServicesSelection] = useState("");
    const entityOptions = [{ value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }, { value: 'other', label: 'Other' }]
    
    console.log("servicesSelection",servicesSelection)
    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                        ? "bg-blue-50 text-gray-800"
                        : "bg-gray-800 text-gray-200"
                        }`}>
                        <h2 className="text-m font-semibold mb-0"> The relationship between the Panama entity you are establishing and your group companies</h2>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Is the Panama entity you are forming part of a group or will you be buying or selling entities or assets in connection with the group?
                                <span className="text-red-500 inline-flex">*</span>
                            </Label>
                            <RadioGroup value={servicesSelection} onValueChange={setServicesSelection} className="gap-4">
                                {entityOptions.map(option => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                        <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                                {servicesSelection === "other" && (
                                    <Input placeholder="Please specify" />
                                )}
                            </RadioGroup>
                        </div>
                        {servicesSelection === 'yes' && <div className="space-y-2">
                            <Label htmlFor="entity" className="inline-flex">
                            Describe how the Panamanian entity you are establishing and the group company (or related companies) are connected in business (outsourcing, simple foreign affiliation, etc.) <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="entity" placeholder="Descibe entity" className="w-full" />
                        </div>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PanamaEntity