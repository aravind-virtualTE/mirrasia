import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ArticlesOfAssociation() {
  const companyName = "TRUSTPAY AI SYSTEMS LIMITED"
  const shareCapital = {
    totalShares: "100",
    totalAmount: "USD 100",
    paidUp: "USD 100",
    unpaid: "USD 0",
  }

  return (
    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0">
      <CardHeader className="space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-xl font-bold">
            THE COMPANIES ORDINANCE (CHAPTER 622)
          </h1>
          <div className="space-y-2">
            <h2 className="text-lg font-bold">
              Private Company Limited by Shares
            </h2>
            <h2 className="text-lg font-bold">ARTICLES OF ASSOCIATION</h2>
            <h2 className="text-lg font-bold">OF</h2>
          </div>
          <h2 className="text-xl font-bold">
            <span className=" px-1">{companyName}</span>
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
              <span className=" px-1">
                "TRUSTPAY AI SYSTEMS LIMITED"
              </span>
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
            <span className="font-bold">
              3. Liabilities or Contributions of Members
            </span>
            <p>
              The liability of the members is limited to any amount unpaid on the
              shares held by the members.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold">
            4. Share Capital and Initial Shareholdings (on the company's formation)
          </h3>
          <div className="grid grid-cols-[1fr,auto] gap-4">
            <div>
              The total number of shares that the company proposes to issue
            </div>
            <div className="w-[300px] border">
              <div className="p-2 text-center">
                <span className=" px-1">
                  {shareCapital.totalShares}
                </span>
              </div>
            </div>

            <div>
              The total amount of share capital to be subscribed by the company's
              founder members
            </div>
            <div className="w-[300px] border">
              <div className="p-2 text-center">
                <span className=" px-1">
                  {shareCapital.totalAmount}
                </span>
              </div>
            </div>

            <div className="pl-8">
              (i) The amount to be paid up or to be regarded as paid up
            </div>
            <div className="w-[300px] border">
              <div className="p-2 text-center">
                <span className=" px-1">{shareCapital.paidUp}</span>
              </div>
            </div>

            <div className="pl-8">
              (ii) The amount to remain unpaid or to be regarded as remaining
              unpaid
            </div>
            <div className="w-[300px] border">
              <div className="p-2 text-center">
                <span className=" px-1">{shareCapital.unpaid}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

