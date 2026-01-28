import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";

const Section13 =  ({ canEdit }: { canEdit: boolean }) => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const { theme } = useTheme();
    const { t } = useTranslation();
    return (
        <div className='flex flex-col md:flex-row w-full p-4'>
            <aside
                className={`w-full md:w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                    ? "bg-blue-50 text-gray-800"
                    : "bg-gray-800 text-gray-200"
                    }`}
            >
                <h2 className="text-m font-semibold mb-0">{t("usa.bInfo.accountHeading")}</h2>
                <p className="text-sm text-gray-600">{t("usa.bInfo.accountingAddress")}</p>
            </aside>
            <div className="w-3/4 ml-4">
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">{t("usa.bInfo.enterAddress")}
                    </Label>
                    <Input id="descBusiness" placeholder={t("usa.AppInfo.namePlaceholder")}required value={formData.accountingDataAddress} onChange={(e) => setFormData({ ...formData, accountingDataAddress: e.target.value })} disabled={!canEdit} />
                </div>
            </div>
        </div>

    )
}

export default Section13