// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { useTranslation } from "react-i18next";
// import DropdownSelect from "@/components/DropdownSelect";
// import { usaFormWithResetAtom } from "../UsState";
// import { useAtom } from "jotai";

// export default function Section2() {
//     const { t } = useTranslation();
//     const list = [
//         t('usa.Section2StateOptions.Delaware'),
//         t('usa.Section2StateOptions.Wyoming'),
//         t('usa.Section2StateOptions.California'),
//         t('usa.Section2StateOptions.New York'),
//         t('usa.Section2StateOptions.Washington D.C.'),
//         t('usa.Section2StateOptions.State of Texas'),
//         t('usa.Section2StateOptions.Nevada'),
//         t('usa.Section2StateOptions.Florida'),
//         t('usa.Section2StateOptions.Georgia'),
//         t('usa.Section2StateOptions.Other'),
//     ];
//     const [formData, setFormData] = useAtom(usaFormWithResetAtom);

//     const handleOptionChange = (value: string | number) => {
//         setFormData({ ...formData, selectedState: value });
//     };
//     return (
//         <Card className="max-w-5xl mx-auto mt-2">
//             <CardHeader className="bg-sky-100 dark:bg-sky-900">
//                 <CardTitle className="text-lg font-medium">State Selection</CardTitle>
//             </CardHeader>

//             <CardContent className="space-y-6 pt-6">
//                 <div className="space-y-2">
//                     <Label htmlFor="name" className="inline-flex">
//                     {t('usa.Section2StateQuestion')} <span className="text-destructive">*</span>
//                     </Label>
//                 </div>

//                 <div className="space-y-2">
//                     <DropdownSelect
//                         options={list}
//                         placeholder="Select..."
//                         selectedValue={formData.selectedState}
//                         onSelect={handleOptionChange}
//                     />
//                 </div>

//             </CardContent>
//         </Card>
//     )
// }