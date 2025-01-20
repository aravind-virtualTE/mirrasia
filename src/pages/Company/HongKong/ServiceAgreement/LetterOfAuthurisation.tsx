import { useEffect, useState } from 'react'
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
import SignatureModal from '@/components/pdfPage/SignatureModal'
import { useAtom } from 'jotai'
import { serviceAgreement } from '@/store/hongkong'
import DropdownSelect from '@/components/DropdownSelect'
import { shareHolderDirectorControllerAtom } from '@/lib/atom'

type PersonDetails = {
  name: string | number;
  email: string 
  tel: string 
  kakaoWechat: string 
  directorName: string 
};

export default function AuthorizationDetails() {
const [sdcInfo, ] = useAtom(
    shareHolderDirectorControllerAtom
  );

  const [shrDirList, setShrDirList] = useState(
      sdcInfo.shareHolders.map((item) => {
        if (item.name == "") return "Select Value";
        return item.name;
      })
    );

    useEffect(() => {
        setShrDirList(
          sdcInfo.shareHolders.map((item) => {
            if (item.name == "") return "Enter Value Above and Select Value";
            return item.name;
          })
        );
      }, [sdcInfo]);

  const [isEditing, setIsEditing] = useState(false)
  const [serviceAgrementDetails, setServiceAgrement] = useAtom(serviceAgreement);
  const [signature, setSignature] = useState<string | "">("");

  const [personDetails, setPersonDetails] = useState<PersonDetails>({
    name: "",
    email: "",
    tel: "",
    kakaoWechat: "NIL",
    directorName: ""
  })
  // console.log("serviceAgrementDetails",serviceAgrementDetails.shareholderList )


  useEffect(() => {
    console.log("serviceAgrementDetails.authorizedDetails",serviceAgrementDetails.authorizedDetails)
    if (serviceAgrementDetails.authorizedDetails )
      setPersonDetails({
        name: serviceAgrementDetails.authorizedDetails[0].name,
        email: serviceAgrementDetails.authorizedDetails[0].email,
        tel: serviceAgrementDetails.authorizedDetails[0].tel,
        kakaoWechat: serviceAgrementDetails.authorizedDetails[0].kakaoWechat,
        directorName: serviceAgrementDetails.directorList?.[0]?.name || ""
      })
      setSignature(serviceAgrementDetails.directorList?.[0]?.signature || "")
  }, [serviceAgrementDetails])

  // const [signEdit, setSignEdit] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBoxClick = () => {
    if(signature == "" || signature == null)   setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | "") => {
    setSignature(selectedSignature);
    setIsModalOpen(false);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonDetails(prev => ({ ...prev, [name]: value }))
    setServiceAgrement({...serviceAgrementDetails, authorizedDetails: [{...personDetails, [name]: value}]})
  }

  const toggleEdit = () => {
    setIsEditing(prev => !prev)
  }
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent row
  };

  // const handleSignature = (signature: string) => {
  //   // console.log("Received signature:", signature);
  //   setSignEdit(false);
  //   setSignature(signature)
  // };
  // const handleClear = () => {
  //   setSignature(null);
  // };

  // const handleBoxClick = () => {
  //   if (signature) {
  //     handleClear();
  //   } else {
  //     setSignEdit(true);
  //   }
  // };
  const handleSelect = (value: string | number) => {
      // console.log('Selected Value:', value);
      setPersonDetails(prev => ({ ...prev, 'name': value }))
      setServiceAgrement({...serviceAgrementDetails, authorizedDetails: [{...personDetails, 'name': value}]})
      
    };

  // console.log("personDetails.directorName",personDetails.directorName)
  return (
    <Card className="max-w-4xl mx-auto p-8 rounded-none">
      <CardHeader className="space-y-4">
        <div className="flex justify-between text-sm ">
          <span>BRN .: {serviceAgrementDetails.brnNo}</span>
          <span>(Registered in Hong Kong)</span>
        </div>
        <CardTitle className="text-center font-bold">{serviceAgrementDetails.companyName}</CardTitle>
        <p className="text-center text-sm">("the company")</p>
        <div className="space-y-2 pt-4">
          <p>To MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</p>
          <p className="font-medium underline">Letter of Authorisation</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-4 text-center">
            Re : Authorised and Designated person(s) for communications on behalf of the company
            <div className="w-full border-b-2 border-black"></div>
          </h3>
          <p className="text-sm">
            This is to authorise following person(s) to contact and communicate in respect of all matters regarding the company with immediate
            effect until further notice, and we hereby agree that MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY
            LIMITED may also disclose information of the company to following authorised and designated person(s).
          </p>
        </div>

        <Table className="border border-gray-300" onClick={toggleEdit}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] border border-gray-300">No.</TableHead>
              <TableHead className="border border-gray-300">Name of authorised and designated person(s)</TableHead>
              <TableHead className="border border-gray-300">Email</TableHead>
              <TableHead className="border border-gray-300">Tel</TableHead>
              <TableHead className="border border-gray-300">Kakao / Wechat</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody >
            <TableRow   className="border border-gray-300">
              <TableCell className="border border-gray-300">1</TableCell>
              <TableCell className="border border-gray-300">
                {isEditing ? (
                  <>
                  {/* <Input
                    name="name"
                    value={personDetails.name}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                  /> */}
                  
                   {shrDirList.length > 0 ? (
                    <DropdownSelect
                      options={shrDirList}
                      placeholder="Select significant Controller"
                      onSelect={handleSelect}
                      selectedValue={personDetails.name}
                    />
                  ) : (
                    personDetails.name
                  )}
                  </>
                ) : (
                  personDetails.name
                )}
              </TableCell>
              <TableCell className="border border-gray-300">
                {isEditing ? (
                  <Input
                    name="email"
                    value={personDetails.email}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                  />
                ) : (
                  personDetails.email
                )}
              </TableCell>
              <TableCell className="border border-gray-300">
                {isEditing ? (
                  <Input
                    name="tel"
                    value={personDetails.tel}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                  />
                ) : (
                  personDetails.tel
                )}
              </TableCell>
              <TableCell className="border border-gray-300">
                {isEditing ? (
                  <Input
                    name="kakaoWechat"
                    value={personDetails.kakaoWechat}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
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
          <p>Dated: {serviceAgrementDetails.consentSignDate}</p>
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
          <div className="border-t border-black w-48">
            <p className="font-medium">{personDetails.directorName}</p>
            <p className="text-sm italic">Director</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
