import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useState } from "react"
import SignatureModal from "@/components/pdfPage/SignatureModal"
import { serviceAgreement  } from "@/store/hongkong"
import { useAtom } from "jotai"

interface Director {
    dateOfAppointment: string
    fullName: string
    nationalityAndId: string
    correspondenceAddress: string
    residentialAddress: string
    businessOccupation: string
    dateCeasingToAct: string
    entryMadeBy: string
}

export default function RegisterOfDirectors() {
    
    const [serviceAgrementDetails, setServiceAgrementDetails] = useAtom(serviceAgreement )

    const [signature, setSignature] = useState<string | null>(serviceAgrementDetails.registerDirectorSignature ?? null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleBoxClick = () => {
        setIsModalOpen(true);
    };

    const handleSelectSignature = (selectedSignature: string | null) => {
        setSignature(selectedSignature);
        setServiceAgrementDetails({...serviceAgrementDetails, registerDirectorSignature: selectedSignature })
        setIsModalOpen(false);
    };
    
    const directors: Director[] = [
        {
            dateOfAppointment: "",
            fullName: "",
            nationalityAndId: "",
            correspondenceAddress:
                "",
            residentialAddress:
                "",
            businessOccupation: "",
            dateCeasingToAct: "",
            entryMadeBy: "",
        },
        // Empty rows for demonstration
        ...Array(3).fill({
            dateOfAppointment: "",
            fullName: "",
            nationalityAndId: "",
            correspondenceAddress: "",
            residentialAddress: "",
            businessOccupation: "",
            dateCeasingToAct: "",
            entryMadeBy: "",
        }),
    ]

    return (
        <Card className="w-full max-w-[1200px] mx-auto print:p-0 rounded-none">
            <CardHeader className="space-y-4 pb-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <p className="font-serif text-sm">Name of Company: <span className=" px-1  underline ">{serviceAgrementDetails.companyName}</span></p>
                        </div>
                        <div className="flex gap-2 font-serif">
                            <p className="font-serif text-sm">BRN Number: <span className=" px-1  underline ">{serviceAgrementDetails.brnNo}</span></p>
                        </div>
                    </div>
                    <h1 className="text-l font-serif font-semibold">REGISTER OF DIRECTORS</h1>
                </div>
            </CardHeader>

            <CardContent>
                <Table className="border-collapse [&_*]:border-black">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border  text-black text-center whitespace-nowrap">
                                Date of
                                <br />
                                Appointment
                            </TableHead>
                            <TableHead className="border  text-black text-center">
                                Full Name
                                <br />
                                <span className="font-normal text-xs">
                                    (Any Former Names or Alias)
                                </span>
                            </TableHead>
                            <TableHead className="border  text-black text-center">
                                Nationality and ID/PPT No.
                            </TableHead>
                            <TableHead className="border  text-black text-center">
                                Correspondence Address
                            </TableHead>
                            <TableHead className="border  text-black text-center">
                                Residential Address
                                <br />
                                <span className="font-normal text-xs">
                                    (or Registered Office Address)
                                </span>
                            </TableHead>
                            <TableHead className="border  text-black text-center">
                                Business Occupation or
                                <br />
                                Other Directorship
                            </TableHead>
                            <TableHead className="border  text-black text-center whitespace-nowrap">
                                Date of Ceasing
                                <br />
                                to Act
                            </TableHead>
                            <TableHead className="border  text-black text-center">
                                Entry Made By
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {directors.map((director, index) => (
                            <TableRow key={index}>
                                <TableCell className="border">
                                    {director.dateOfAppointment}
                                </TableCell>
                                <TableCell className="border">
                                    {director.fullName && (
                                        <span className=" px-1">{director.fullName}</span>
                                    )}
                                </TableCell>
                                <TableCell className="border whitespace-pre-line">
                                    {director.nationalityAndId && (
                                        <span className=" px-1">
                                            {director.nationalityAndId}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="border">
                                    {director.correspondenceAddress && (
                                        <span className=" px-1">
                                            {director.correspondenceAddress}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="border">
                                    {director.residentialAddress && (
                                        <span className=" px-1">
                                            {director.residentialAddress}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="border">
                                    {director.businessOccupation && (
                                        <span className=" px-1">
                                            {director.businessOccupation}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="border">
                                    {director.dateCeasingToAct}
                                </TableCell>
                                <TableCell className="border text-center">
                                    {director.entryMadeBy && (
                                        <span className=" px-1">
                                            {director.entryMadeBy}
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="flex flex-col items-stretch mt-6 space-y-6">
                <div className="flex justify-between items-end">
                    <p className="text-xs uppercase">
                        PLEASE NOTE: THE ORIGINAL OR COPY MUST BE KEPT AT THE REGISTERED OFFICE.
                    </p>
                    <p className="text-xs">Page No. 1</p>
                </div>
                <div className="flex justify-end">
                    <div className="text-right space-y-4">
                        <p className="italic">For and on behalf of</p>
                        <p className="px-1 inline-block font-serif">{serviceAgrementDetails.companyName}</p>
                        <div className="w-64 pt-2">
                            <div
                                onClick={handleBoxClick}
                                className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {signature ? (
                                    <img
                                        src={signature}
                                        alt="Selected signature"
                                        className="max-h-20 max-w-full object-contain"
                                    />
                                ) : (
                                    <p className="text-gray-400">Click to sign</p>
                                )}
                            </div>
                            {isModalOpen && (
                                <SignatureModal
                                    onSelectSignature={handleSelectSignature}
                                    onClose={() => setIsModalOpen(false)}
                                />
                            )}
                        </div>
                        <div className="border-t border-black w-48 mt-12">
                            <p className="text-sm text-center mt-1">Authorised Signature(s)</p>
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
