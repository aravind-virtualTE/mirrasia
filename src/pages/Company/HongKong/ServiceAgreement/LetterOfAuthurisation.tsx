import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import InlineSignatureCreator from '../../SignatureComponent'

export default function AuthorizationDetails() {

  const [isEditing, setIsEditing] = useState(false)
  const [docSigned,] = useState('2024-12-12')
  const [personDetails, setPersonDetails] = useState({
    companyName: "TestCompany",
    name: "Test Name",
    email: "Test@gmail.com",
    tel: "+971522768157",
    kakaoWechat: "NIL",
    directorName: "TestUser"
  })
  const [signature, setSignature] = useState<string | null>(null);
  const [signEdit, setSignEdit] = useState(false)


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonDetails(prev => ({ ...prev, [name]: value }))
  }

  const toggleEdit = () => {
    setIsEditing(prev => !prev)
  }


  const handleSignature = (signature: string) => {
    // console.log("Received signature:", signature);
    setSignEdit(false);
    setSignature(signature)
  };
  const handleClear = () => {
    setSignature(null);
  };

  const handleBoxClick = () => {
    if (signature) {
      handleClear();
    } else {
      setSignEdit(true);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-8 rounded-none">
      <CardHeader className="space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>UBI NO.: </span>
          <span>(Registered in Hong Kong)</span>
        </div>
        <CardTitle className="text-center">{personDetails.companyName}</CardTitle>
        <p className="text-center text-sm">("the company")</p>
        <div className="space-y-2 pt-4">
          <p>To MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</p>
          <p className="font-medium">Letter of Authorisation</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-4 text-center">
            Re : Authorised and Designated person(s) for communications on behalf of the company
          </h3>
          <p className="text-sm">
            This is to authorise following person(s) to contact and communicate in respect of all matters regarding the company with immediate
            effect until further notice, and we hereby agree that MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY
            LIMITED may also disclose information of the company to following authorised and designated person(s).
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead>Name of authorised and designated person(s)</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tel</TableHead>
              <TableHead>Kakao / Wechat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow onClick={toggleEdit}>
              <TableCell>1</TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    name="name"
                    value={personDetails.name}
                    onChange={handleInputChange}
                  />
                ) : (
                  personDetails.name
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    name="email"
                    value={personDetails.email}
                    onChange={handleInputChange}
                  />
                ) : (
                  personDetails.email
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    name="tel"
                    value={personDetails.tel}
                    onChange={handleInputChange}
                  />
                ) : (
                  personDetails.tel
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    name="kakaoWechat"
                    value={personDetails.kakaoWechat}
                    onChange={handleInputChange}
                  />
                ) : (
                  personDetails.kakaoWechat
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* <div className="flex justify-end">
          <Button onClick={toggleEdit}>
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div> */}

        <div className="pt-6 space-y-4 w-64">
          <p>Dated: {docSigned}</p>
          {signEdit ? (
            <InlineSignatureCreator
              onSignatureCreate={handleSignature}
              maxWidth={256}
              maxHeight={100}
            />
          ) : (
            <div
              onClick={handleBoxClick}
              className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {signature ? (
                <img
                  src={signature}
                  alt="Director's signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <p className="text-gray-400">Click to sign</p>
              )}
            </div>
          )}
          <div className="border-t border-black w-48">
            <p className="font-medium">{personDetails.directorName}</p>
            <p className="text-sm italic">Director</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
