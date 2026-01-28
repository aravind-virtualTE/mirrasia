import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import HongKongMemberDirectorChanges from "./countries/HongKongInvoicing";
import SingaporeInvoicing from "./countries/SingaporeInvoicing";
import PanamaInvoicing from "./countries/PanamaInvoicing";
import USAInvoicing from "./countries/USAInvoicing";
import { useAtom } from "jotai";
import { countryAtom, fetchInvoicesOrders } from "./memberDirShareholder";
import { useEffect } from "react";
import InvoiceOrdersTableView from "./History";

const countries = [
  { value: "hong_kong", label: "Hong Kong", component: HongKongMemberDirectorChanges },
  { value: "singapore", label: "Singapore", component: SingaporeInvoicing },
  { value: "panama", label: "Panama", component: PanamaInvoicing },
  { value: "usa", label: "USA", component: USAInvoicing },
];

export default function MemberDirectorManager() {
  const [country, setCountry] = useAtom(countryAtom);

  const SelectedCountryComponent = countries.find((c) => c.value === country)?.component;

  useEffect(() =>{
    const fetchData = async () => {
      try {
        const response = await fetchInvoicesOrders();  
        console.log("user profile--->", response);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchData();
  }, [])

  return (
    <div className="w-full mx-auto">
      <h1 className="text-2xl font-semibold">Change of Member/Shareholder & Director</h1>
      <Tabs defaultValue="invoicing" className="w-full">
        {/* Header row: Tabs (left) + Country select (right) */}
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <TabsList className="w-full md:w-auto flex-shrink-0">
            <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <div className="w-full md:w-80">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="invoicing" className="mt-0">
          <div className="space-y-4">
            {country ? (
              <Card>                
                <CardContent className="py-6 px-0">
                  {SelectedCountryComponent ? (
                    // key forces a clean remount when switching countries (avoids stale internal state)
                    <SelectedCountryComponent key={country} />
                  ) : (
                    <p className="text-muted-foreground">
                      Please select a country to view the invoicing form.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-6">
                  <p className="text-muted-foreground">
                    Choose a country from the top-right to begin invoicing.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>          
            <CardContent>
              {/* <p className="text-muted-foreground">Change history will appear here.</p> */}
              <InvoiceOrdersTableView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
