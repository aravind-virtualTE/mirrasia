import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function CustomerDueDiligence() {
  const formData = {
    personalInfo: {
      title: "Mr",
      firstName: "SHAHAD",
      familyName: "AHMED",
      occupation: "MERCHANT",
      cityOfBirth: "WORDESLEY",
      dateOfBirth: "30/11/1986",
      countryOfBirth: "UNITED KINGDOM",
      nationality: "UNITED KINGDOM",
      maritalStatus: ""
    },
    address: {
      residential: "FLAT-AP-424, 381-NAKHLAT JUMEIRAH, 1, DUBAI",
      country: "UNITED ARAB EMIRATES"
    },
    contact: {
      tel: "",
      mobile: "",
      email: "",
      fax: ""
    }
  };

  return (
      <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0">
        <CardHeader>
          <CardTitle className="text-xl text-center font-bold">
            CUSTOMER DUE DILIGENCE (INDIVIDUALS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            Please complete and sign Section A and submit the documents listed in Section B with the certification cover letter provided on page 3. 
            This should be completed by each connected individual (director/officer, shareholder, beneficial owner, councillor, protector, power of attorney holder, etc.). 
            For any questions, please contact the MIRR ASIA consultant that is assisting you with your application.
          </p>

          {/* Section 1.0 - Personal Information */}
          <div>
            <h2 className="text-white bg-gray-700 p-2 mb-4">1.0 – PERSONAL INFORMATION</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (e.g. Mr, Mrs., Dr):</Label>
                <div className=" p-2">{formData.personalInfo.title}</div>
              </div>
              <div>
                <Label>Family Name:</Label>
                <div className=" p-2">{formData.personalInfo.familyName}</div>
              </div>
              <div>
                <Label>First and Other Names:</Label>
                <div className=" p-2">{formData.personalInfo.firstName}</div>
              </div>
              <div>
                <Label>Occupation:</Label>
                <div className=" p-2">{formData.personalInfo.occupation}</div>
              </div>
              <div>
                <Label>City or Town of Birth:</Label>
                <div className=" p-2">{formData.personalInfo.cityOfBirth}</div>
              </div>
              <div>
                <Label>Country of Birth:</Label>
                <div className=" p-2">{formData.personalInfo.countryOfBirth}</div>
              </div>
              <div>
                <Label>Date of Birth:</Label>
                <div className=" p-2">{formData.personalInfo.dateOfBirth}</div>
              </div>
              <div>
                <Label>Nationality:</Label>
                <div className=" p-2">{formData.personalInfo.nationality}</div>
              </div>
            </div>
          </div>

          {/* Section 1.1 - Tax/FATCA/CRS/PEP Status */}
          <div>
            <h2 className="text-white bg-gray-700 p-2 mb-4">1.1 – TAX/FATCA/CRS/PEP STATUS (REQUIRED)</h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">I am a "US Person" for FATCA reporting purposes?</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="fatca-yes" />
                    <label htmlFor="fatca-yes">Yes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="fatca-no" />
                    <label htmlFor="fatca-no">No</label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">
                  I currently hold/have previously held a position of "Public Authority"?
                </Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="public-yes" />
                    <label htmlFor="public-yes">Yes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="public-no" />
                    <label htmlFor="public-no">No</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1.2 - Permanent Residential Address */}
          <div>
            <h2 className="text-white bg-gray-700 p-2 mb-4">1.2 – PERMANENT RESIDENTIAL ADDRESS AND CONTACT DETAILS (REQUIRED)</h2>
            <div className="space-y-4">
              <div>
                <Label>Address:</Label>
                <div className=" p-2">{formData.address.residential}</div>
              </div>
              <div>
                <Label>Country:</Label>
                <div className=" p-2">{formData.address.country}</div>
              </div>
            </div>
          </div>

          {/* Section 1.3 - Other Contact Details */}
          <div>
            <h2 className="text-white bg-gray-700 p-2 mb-4">1.3 – OTHER CONTACT DETAILS (REQUIRED)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tel:</Label>
                <Input type="tel" />
              </div>
              <div>
                <Label>Mobile:</Label>
                <Input type="tel" />
              </div>
              <div>
                <Label>Email:</Label>
                <Input type="email" />
              </div>
              <div>
                <Label>Fax:</Label>
                <Input type="tel" />
              </div>
            </div>
          </div>

          {/* Section 1.4 - Preferred Method of Contact */}
          <div>
            <h2 className="text-white bg-gray-700 p-2 mb-4">1.4 - PREFERRED METHOD OF CONTACT</h2>
            <div className="flex gap-4 flex-wrap">
              {["Telephone", "Mobile", "Email", "Fax", "Registered Post", "Courier"].map((method) => (
                <div key={method} className="flex items-center gap-2">
                  <Checkbox id={`contact-${method.toLowerCase()}`} />
                  <label htmlFor={`contact-${method.toLowerCase()}`}>{method}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Section 1.5 - Declaration and Signature */}
          <div>
            <h2 className="text-white bg-gray-700 p-2 mb-4">1.5 – DECLARATION AND SIGNATURE</h2>
            <p className="mb-4">I hereby declare and confirm that the information in this form is true and correct.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Signature:</Label>
                <div className="border p-8 rounded"></div>
              </div>
              <div>
                <Label>Date:</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}

export default CustomerDueDiligence;