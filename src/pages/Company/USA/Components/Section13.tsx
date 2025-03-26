import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import { useTheme } from "@/components/theme-provider";

const Section13 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const { theme } = useTheme();
    return (
        <div className='flex flex-col md:flex-row w-full p-4'>
            <aside
                className={`w-full md:w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                    ? "bg-blue-50 text-gray-800"
                    : "bg-gray-800 text-gray-200"
                    }`}
            >
                <h2 className="text-m font-semibold mb-0">
                    The location where the accounting/financial data of the proposed US company will be kept
                </h2>
                <p className="text-sm text-gray-600">  If you store accounting statements, financial data, contracts, invoices, etc. in a country other than the United States, please enter your address below.</p>
            </aside>
            <div className="w-3/4 ml-4">
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Please enter the address where the accounting and financial data of the proposed US company will be kept.
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required value={formData.accountingDataAddress} onChange={(e) => setFormData({ ...formData, accountingDataAddress: e.target.value })} />
                </div>
            </div>
        </div>

    )
}

export default Section13