import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import SignatureModal from "@/components/pdfPage/SignatureModal";
import { serviceAgreement } from "@/store/hongkong";
import { useAtom } from "jotai";

export default function CustomerDueDiligence() {
  const [signature, setSignature] = useState<string | null>(null);
  const [serviceAgrementDetails, setServiceAgrement] = useAtom(serviceAgreement);
  const initialSet = {
    personalInformation: {
      title: "",
      familyName: "",
      name: "",
      formerName: "",
      occupation: "",
      maritalStatus: "",
      cityBirthTown: "",
      birthCountry: "",
      dateOfBirth: "",
      nationality: "",
    },
    taxFacta: {
      factaReportingPuropose: false,
      isPublicAuthority: false,
      countryOfTaxResidence: "",
      taxIdNumber: "",
    },
    permanetResidence: {
      address: "",
      postCode: "",
      country: "",
    },
    otherContactDetails: {
      tel: "",
      mobile: "",
      email: "",
      fax: "",
    },
    preferredMethodOfContact: {
      telephone: false,
      mobile: false,
      email: false,
      fax: false,
      registeredPost: false,
      courier: false,
    },
    cddDate: "",
    cddSignature: "",
    pedSignature : "",
    pedDate : "",    
    politicallyExposed: false,
    politicallyNotExposed: false,
  };
  const [cddForm, setFormData] = useState(serviceAgrementDetails.customerDueDiligence || initialSet);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() =>{
    setServiceAgrement((prev) => ({...prev, customerDueDiligence: cddForm}))
  }, [cddForm])
  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature);
    setServiceAgrement({...serviceAgrementDetails, 
      cddSignature: selectedSignature
    });
    setIsModalOpen(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prevState) => ({
      ...prevState,
      ['taxFacta']: {
        ...prevState.taxFacta,
        [field]: value,
      },
    }));
  };

  type SectionName =
    | "personalInformation"
    | "taxFacta"
    | "permanetResidence"
    | "otherContactDetails"
    | "preferredMethodOfContact"

  const handleNestedChange = (
    section: SectionName,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: value,
      },
    }));
  };

  const handlePreferredContactChange = (
    method: string,
    checked: string | boolean
  ) => {
    setFormData((prevState) => ({
      ...prevState,      
      ['preferredMethodOfContact']: {
        ...prevState.preferredMethodOfContact,
        [method]: checked,
      },
    }));
  };

  const handleDateChange = (    value: string  ) => {
    setFormData((prevState) => ({
      ...prevState,      
      ['cddDate']: value,
    }));
  };

  // console.log("serviceAgrementDetails", serviceAgrementDetails);

  return (
    <Card className="max-w-4xl mx-auto p-6 text-sm rounded-none">
      <CardContent>
        <h1 className="text-center font-bold mb-4">
          CUSTOMER DUE DILIGENCE (INDIVIDUALS)
        </h1>
        <p className="text-xs mb-4 leading-normal">
          Please complete and sign Section A and submit the documents listed in
          Section B with the certification cover letter provided on page 3. This
          should be completed by each connected individual (director/officer,
          shareholder, beneficial owner, councillor, protector, power of
          attorney holder, etc.). For any questions, please contact the MIRR
          ASIA consultant that is assisting you with your application.
        </p>
        <div className="text-center mb-4">SECTION A</div>

        {/* Personal Information */}
        <div className="mb-4">
          <div className="bg-gray-600 text-white p-1">
            1.0 – PERSONAL INFORMATION
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 p-2">
            <div className="flex gap-2">
              <div className="w-40">Title (e.g. Mr, Mrs., Dr):</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.title}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "title",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">Family Name:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.familyName}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "familyName",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">First and Other Names:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.name}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "name",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">Former names:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.formerName}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "formerName",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">Occupation:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.occupation}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "occupation",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">Marital Status:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.maritalStatus}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "maritalStatus",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">City or Town of Birth:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.cityBirthTown}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "cityBirthTown",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">Country of Birth:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.birthCountry}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "birthCountry",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">Date of Birth:</div>
              <Input
                className="border flex-1 px-1"
                placeholder="DD/MM/YYYY"
                value={cddForm.personalInformation.dateOfBirth}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "dateOfBirth",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">Nationality:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.personalInformation.nationality}
                onChange={(e) =>
                  handleNestedChange(
                    "personalInformation",
                    "nationality",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Tax/FATCA/CRS/PEP Status */}
        <div className="mb-4">
          <div className="bg-gray-600 text-white p-1">
            1.1 – TAX/FATCA/CRS/PEP STATUS (REQUIRED)
          </div>
          <div className="space-y-2 p-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                I am a "US Person" for FATCA reporting purposes?
              </div>
              <div className="flex gap-4 min-w-[120px]">
                <label className="flex items-center gap-1">
                  <Checkbox
                    className="rounded-none h-4 w-4"
                    checked={cddForm.taxFacta.factaReportingPuropose}
                    onCheckedChange={(checked) =>
                      handleChange("factaReportingPuropose", checked)
                    }
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-1">
                  <Checkbox
                    className="rounded-none h-4 w-4"
                    checked={!cddForm.taxFacta.factaReportingPuropose}
                    onCheckedChange={(checked) =>
                      handleChange("factaReportingPuropose", !checked)
                    }
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                I currently hold/have previously held a position of "Public
                Authority" (e.g., politician, government or military official,
                executive officer of a company controlled by government)?
              </div>
              <div className="flex gap-4 min-w-[120px]">
                <label className="flex items-center gap-1">
                  <Checkbox
                    className="rounded-none h-4 w-4"
                    checked={cddForm.taxFacta.isPublicAuthority}
                    onCheckedChange={(checked) =>
                      handleChange("isPublicAuthority", checked)
                    }
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-1">
                  <Checkbox
                    className="rounded-none h-4 w-4"
                    checked={!cddForm.taxFacta.isPublicAuthority}
                    onCheckedChange={(checked) =>
                      handleChange("isPublicAuthority", !checked)
                    }
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <div className="w-40">Country of Tax Residence:</div>
                <Input 
                  className="border flex-1 px-1"
                  value={cddForm.taxFacta.countryOfTaxResidence}
                  onChange={(e) =>
                    handleNestedChange(
                      "taxFacta",
                      "countryOfTaxResidence",
                      e.target.value
                    )
                  }
                   />
              </div>
              <div className="flex gap-2">
                <div className="w-40">Tax ID Number:</div>
                <Input className="border flex-1 px-1"
                  value={cddForm.taxFacta.taxIdNumber}
                  onChange={(e) =>
                    handleNestedChange(
                      "taxFacta",
                      "taxIdNumber",
                      e.target.value
                    )
                  }
                  />
              </div>
            </div>
            <p>
              Note:{" "}
              <span className="font-semibold">
                {" "}
                MIRR ASIA BUSINESS ADVISORY & SECRETARIAL CO., LIMITED
              </span>{" "}
              will not disclose this information except as required by law or
              where we are obligated to do so for reporting purposes pursuant to
              the <span className="font-semibold">OECD</span> Common Reporting
              Standard <span className="font-semibold">(CRS)</span> framework
              and/or the US Foreign Account Tax Compliance Act{" "}
              <span className="font-semibold">(FATCA)</span>. If you have
              questions about the reporting status of any Entity you have
              established with us please discuss with your{" "}
              <span className="font-semibold">MIRR ASIA</span> consultant or
              your tax advisor.
            </p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="mb-4">
          <div className="bg-gray-600 text-white p-1">
            1.2 – PERMANENT RESIDENTIAL ADDRESS AND CONTACT DETAILS (REQUIRED)
          </div>
          <div className="space-y-2 p-2">
            <div className="flex gap-2">
              <div className="w-40">Address:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.permanetResidence.address}
                onChange={(e) =>
                  handleNestedChange(
                    "permanetResidence",
                    "address",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2">
                <div className="w-40">Post Code:</div>
                <Input
                  className="border flex-1 px-1"
                  value={cddForm.permanetResidence.postCode}
                  onChange={(e) =>
                    handleNestedChange(
                      "permanetResidence",
                      "postCode",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <div className="w-40">Country:</div>
                <Input
                  className="border flex-1 px-1"
                  value={cddForm.permanetResidence.country}
                  onChange={(e) =>
                    handleNestedChange(
                      "permanetResidence",
                      "country",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Other Contact Details */}
        <div className="mb-4">
          <div className="bg-gray-600 text-white p-1">
            1.3 – OTHER CONTACT DETAILS (REQUIRED)
          </div>
          <div className="grid grid-cols-2 gap-4 p-2">
            <div className="flex gap-2">
              <div className="w-20">Tel:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.otherContactDetails.tel}
                onChange={(e) =>
                  handleNestedChange(
                    "otherContactDetails",
                    "tel",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-20">Mobile:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.otherContactDetails.mobile}
                onChange={(e) =>
                  handleNestedChange(
                    "otherContactDetails",
                    "mobile",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-20">Email:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.otherContactDetails.email}
                onChange={(e) =>
                  handleNestedChange(
                    "otherContactDetails",
                    "email",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-20">Fax:</div>
              <Input
                className="border flex-1 px-1"
                value={cddForm.otherContactDetails.fax}
                onChange={(e) =>
                  handleNestedChange(
                    "otherContactDetails",
                    "fax",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Preferred Contact Method */}
        <div className="mb-4">
          <div className="bg-gray-600 text-white p-1">
            1.4 - PREFERRED METHOD OF CONTACT – Please indicate by ticking a box
          </div>
          <div className="flex flex-wrap gap-6 p-2">
            <label className="flex items-center gap-1">
              <Checkbox
                className="rounded-none h-4 w-4"
                checked={cddForm.preferredMethodOfContact.telephone}
                onCheckedChange={(checked) =>
                  handlePreferredContactChange("telephone", checked)
                }
              />
              <span>Telephone</span>
            </label>
            <label className="flex items-center gap-1">
              <Checkbox
                className="rounded-none h-4 w-4"
                checked={cddForm.preferredMethodOfContact.mobile}
                onCheckedChange={(checked) =>
                  handlePreferredContactChange("mobile", checked)
                }
              />
              <span>Mobile</span>
            </label>
            <label className="flex items-center gap-1">
              <Checkbox
                className="rounded-none h-4 w-4"
                checked={cddForm.preferredMethodOfContact.email}
                onCheckedChange={(checked) =>
                  handlePreferredContactChange("email", checked)
                }
              />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-1">
              <Checkbox
                className="rounded-none h-4 w-4"
                checked={cddForm.preferredMethodOfContact.fax}
                onCheckedChange={(checked) =>
                  handlePreferredContactChange("fax", checked)
                }
              />
              <span>Fax</span>
            </label>
            <label className="flex items-center gap-1">
              <Checkbox
                className="rounded-none h-4 w-4"
                checked={cddForm.preferredMethodOfContact.registeredPost}
                onCheckedChange={(checked) =>
                  handlePreferredContactChange("registeredPost", checked)
                }
              />
              <span>Registered Post</span>
            </label>
            <label className="flex items-center gap-1">
              <Checkbox
                className="rounded-none h-4 w-4"
                checked={cddForm.preferredMethodOfContact.courier}
                onCheckedChange={(checked) =>
                  handlePreferredContactChange("courier", checked)
                }
              />
              <span>Courier</span>
            </label>
          </div>
        </div>

        {/* Declaration */}
        <div>
          <div className="bg-gray-600 text-white p-1">
            1.5 – DECLARATION AND SIGNATURE
          </div>
          <div className="p-2 space-y-4">
            <p>
              I hereby declare and confirm that the information in this form is
              true and correct.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div>Signature</div>
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
                <div className="text-xs">(서명)</div>
              </div>
              <div className="space-y-1">
                <div>Date</div>
                <Input className="border w-full px-1" 
                  value={cddForm.cddDate}
                  onChange={(e) =>handleDateChange(e.target.value)}
                 />
                <div className="text-xs">(날짜)</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
