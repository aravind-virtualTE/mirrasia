import { Card, CardHeader, CardTitle, } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../inviteUsaDirShirState';

const Section10 = () => {
    const [] = useAtom(usaFormWithResetAtom);

    return (
        <>
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 10</CardTitle>
                <p className="inline-flex">completion <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="text-red-500 ld h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    </TooltipContent>
                </Tooltip></p>
                <p>Thank you for your hard work. </p>
                <p>We will check your answers and the person in charge will contact you as soon as possible.</p>
                <p>I appreciate it.</p>
            </CardHeader>

        </Card>
       
        </>
    )
}

export default Section10