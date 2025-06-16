import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '@radix-ui/react-dropdown-menu'
import { Shield } from 'lucide-react'
import { Button } from '../ui/button';
// import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface UserVerificationCardProps {
    passportUrl: string;
    addressProofUrl: string;
    passportStatus: string,
    addressProofStatus: string,
    onReviewUpdate?: (adminReview: { passportStatus: string; addressProofStatus: string }) => void
}
type VerificationStatus = 'pending' | 'accepted' | 'rejected'


const UserVerificationCard: React.FC<UserVerificationCardProps> = ({ passportUrl, addressProofUrl, onReviewUpdate,passportStatus,addressProofStatus }) => {
    const [ppStatus, setPassportStatus] = useState<VerificationStatus>(passportStatus as VerificationStatus)
    // const [passportComment, setPassportComment] = useState('')
    const [addressStatus, setAddressStatus] = useState<VerificationStatus>(addressProofStatus as VerificationStatus)
    // const [addressComment, setAddressComment] = useState('')
    // const [isSubmitting, setIsSubmitting] = useState(false)


    const handleSubmit = async () => {
        // setIsSubmitting(true)
        const adminReview = {
            passportStatus: ppStatus,
            addressProofStatus: addressStatus,
            // passportComment: passportComment.trim(),
            // addressComment: addressComment.trim()           
        }
        // Call parent callback to update the verification status
        if (onReviewUpdate) {
            onReviewUpdate(adminReview)
        }
        // setIsSubmitting(false)
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Verification Status

                </CardTitle>

            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-4">
                {/* {passportUrl!== "" ? (
                    <div className="flex-1">
                        <Label className="mb-2 block">Passport Document</Label>
                        <iframe
                            src={passportUrl}
                            className="w-full h-96 border"
                            title="Passport Document"
                        />
                        <Button className="mt-2">
                            <a
                                href={passportUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download Passport/Govt Id
                            </a>
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Passport document not uploaded yet.</p>
                )}

                {addressProofUrl !== "" ? (
                    <div className="flex-1">
                        <Label className="mb-2 block">Address Proof</Label>
                        <iframe
                            src={addressProofUrl}
                            className="w-full h-96 border"
                            title="Address Proof Document"
                        />
                        <Button className="mt-2">
                            <a
                                href={addressProofUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download Address Proof
                            </a>
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Address proof not uploaded yet.</p>
                )} */}
                <div className="w-full flex flex-col lg:flex-row lg:gap-6 gap-4">
                    {/* Passport Document */}
                    <div className="w-full lg:w-1/2 space-y-4">
                        <div>
                            <Label className="mb-2 block font-medium">Passport Document</Label>
                            {passportUrl !== "" ? (
                                <div className="space-y-3">
                                    <iframe
                                        src={passportUrl}
                                        className="w-full h-80 border rounded-md"
                                        title="Passport Document"
                                    />
                                    <Button variant="outline" size="sm">
                                        <a
                                            href={passportUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Download Passport/Govt ID
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-80 border rounded-md bg-gray-50">
                                    <p className="text-sm text-muted-foreground italic">
                                        Passport document not uploaded yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        <Card className={`border-2`}>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-sm">Passport Review</span>
                                </div>

                                <Select
                                    value={ppStatus}
                                    onValueChange={(value: VerificationStatus) =>
                                        setPassportStatus(value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* <Input
                                    placeholder="Enter review comments for passport..."
                                    value={passportComment}
                                    onChange={(e) => setPassportComment(e.target.value)}
                                    className="min-h-[80px]"
                                /> */}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Address Proof Document */}
                    <div className="w-full lg:w-1/2 space-y-4">
                        <div>
                            <Label className="mb-2 block font-medium">Address Proof</Label>
                            {addressProofUrl !== "" ? (
                                <div className="space-y-3">
                                    <iframe
                                        src={addressProofUrl}
                                        className="w-full h-80 border rounded-md"
                                        title="Address Proof Document"
                                    />
                                    <Button variant="outline" size="sm">
                                        <a
                                            href={addressProofUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Download Address Proof
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-80 border rounded-md bg-gray-50">
                                    <p className="text-sm text-muted-foreground italic">
                                        Address proof not uploaded yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        <Card className={`border-2 `}>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-sm">Address Proof Review</span>
                                </div>

                                <Select
                                    value={addressStatus}
                                    onValueChange={(value: VerificationStatus) =>
                                        setAddressStatus(value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* <Input
                                    placeholder="Enter review comments for address proof..."
                                    value={addressComment}
                                    onChange={(e) => setAddressComment(e.target.value)}
                                    className="min-h-[80px]"
                                /> */}
                            </CardContent>
                        </Card>
                    </div>

                </div>

            </CardContent>
            <div className="flex justify-center mb-2">
                <Button
                    onClick={handleSubmit}
                    className="px-8"
                    size="lg"
                >
                    {'Submit Review'}
                </Button>
            </div>

        </Card>
    )
}

export default UserVerificationCard