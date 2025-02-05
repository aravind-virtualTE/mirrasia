import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { serviceAgreement } from "@/store/hongkong"
import { useAtom } from "jotai"

export default function ArticlesOfAssociation({editable}: {editable: boolean}) {
  const [serviceAgrementDetails, setServiceAgrement] = useAtom(serviceAgreement);
  const [articleState, setShareCapital] = useState({
    shareCapital: "0",
    paidUp: "0",
    unpaid: "0",
  })



  useEffect(() => {
      if (serviceAgrementDetails.articleAssociation) {
        setShareCapital({
          shareCapital: serviceAgrementDetails.articleAssociation.shareCapital,
          paidUp: serviceAgrementDetails.articleAssociation.paidUp,
          unpaid: serviceAgrementDetails.articleAssociation.unpaid,
        });
      }
    }, []);


    useEffect(() => {
      setServiceAgrement(prev => ({ 
        ...prev, 
        articleAssociation: {
          ...prev.articleAssociation,
          ...articleState,
          shareClass: prev.articleAssociation?.shareClass || "",
          founderMembers: prev.articleAssociation?.founderMembers || []
        }
      }))
    }, [articleState]);

    
  const handleShareCapitalChange = (field: keyof typeof articleState, value: string) => {
    setShareCapital((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0 rounded-none">
      <CardHeader className="space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-xl font-bold">THE COMPANIES ORDINANCE (CHAPTER 622)</h1>
          <div className="space-y-2">
            <h2 className="text-lg font-bold">Private Company Limited by Shares</h2>
            <h2 className="text-lg font-bold">ARTICLES OF ASSOCIATION</h2>
            <h2 className="text-lg font-bold">OF</h2>
          </div>
          <h2 className="text-xl font-bold">
            <span className="underline px-1">{serviceAgrementDetails.companyName}</span>
          </h2>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div>
          <h2 className="font-bold mb-4">Part A Mandatory Articles</h2>
          <div className="space-y-6">
            <div className="flex gap-2">
              <span className="font-bold">1. Company Name</span>
              <span>The name of the company is</span>
            </div>
            <div className="text-center">
              <span className="underline px-1">{serviceAgrementDetails.companyName}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-bold">2. Members' Liabilities</span>
            <p>The liability of the members is limited.</p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-bold">3. Liabilities or Contributions of Members</span>
            <p>The liability of the members is limited to any amount unpaid on the shares held by the members.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold">4. Share Capital and Initial Shareholdings (on the company's formation)</h3>
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <div>The total number of shares that the company proposes to issue</div>
            <div className="w-[300px] border text-center">
              {serviceAgrementDetails.registerAmount}
            </div>

            <div>The total amount of share capital to be subscribed by the company's founder members</div>
            <div className="w-[300px] border">
              <Input
                value={articleState.shareCapital}
                onChange={(e) => handleShareCapitalChange("shareCapital", e.target.value)}
                className="border-none text-center h-auto py-2"
                disabled={editable}
              />
            </div>

            <div className="pl-8">(i) The amount to be paid up or to be regarded as paid up</div>
            <div className="w-[300px] border">
              <Input
                value={articleState.paidUp}
                onChange={(e) => handleShareCapitalChange("paidUp", e.target.value)}
                className="border-none text-center h-auto py-2"
                disabled={editable}
              />
            </div>

            <div className="pl-8">(ii) The amount to remain unpaid or to be regarded as remaining unpaid</div>
            <div className="w-[300px] border">
              <Input
                value={articleState.unpaid}
                onChange={(e) => handleShareCapitalChange("unpaid", e.target.value)}
                className="border-none text-center h-auto py-2"
                disabled={editable}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

