/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, ExternalLink, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMcapCompanies } from "@/services/dataFetch";
import McapCompanyDocumentCenter from "@/mcap/documents/McapCompanyDocumentCenter";

interface TokenData {
  userId: string;
  role: "user" | "admin" | "master" | string;
}

type McapCompanyListItem = {
  _id: string;
  countryCode?: string;
  countryName?: string;
  companyName?: string;
  applicantName?: string;
  applicantEmail?: string;
  status?: string;
  paymentStatus?: string;
  data?: Record<string, any>;
};

const resolveCompanyName = (company: McapCompanyListItem) => {
  const data = company?.data || {};
  return (
    company?.companyName ||
    data?.companyName1 ||
    data?.companyName_1 ||
    data?.name1 ||
    data?.foundationNameEn ||
    data?.companyName ||
    "Untitled Company"
  );
};

const normalizeCompaniesPayload = (response: any): McapCompanyListItem[] => {
  const payload = response?.data;
  const list = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];

  return list.filter((item: any) => item?._id && item?.countryCode);
};

export default function McapDocumentsHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<McapCompanyListItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const token = useMemo(() => localStorage.getItem("token") || "", []);
  const requestedCompanyId = searchParams.get("companyId") || "";
  const { userId, role } = useMemo(() => {
    if (!token) return { userId: "", role: "" } as TokenData;
    try {
      return jwtDecode<TokenData>(token);
    } catch {
      return { userId: "", role: "" } as TokenData;
    }
  }, [token]);

  useEffect(() => {
    let active = true;

    const loadCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await getMcapCompanies({
          ...(role === "user" && userId ? { userId } : {}),
          withMeta: true,
          page: 1,
          limit: 0,
          sortBy: "country",
          sortOrder: "asc",
        });

        const list = normalizeCompaniesPayload(response);
        if (!active) return;

        setCompanies(list);
      } catch {
        if (!active) return;
        setCompanies([]);
        setSelectedCompanyId("");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadCompanies();

    return () => {
      active = false;
    };
  }, [role, userId]);

  useEffect(() => {
    if (companies.length === 0) {
      setSelectedCompanyId("");
      return;
    }

    const hasRequested = requestedCompanyId && companies.some((company) => String(company._id) === requestedCompanyId);
    if (hasRequested) {
      setSelectedCompanyId(requestedCompanyId);
      return;
    }

    const currentExists = selectedCompanyId && companies.some((company) => String(company._id) === selectedCompanyId);
    if (currentExists) return;

    const firstId = String(companies[0]._id);
    setSelectedCompanyId(firstId);
    if (requestedCompanyId !== firstId) {
      setSearchParams({ companyId: firstId }, { replace: true });
    }
  }, [companies, requestedCompanyId, selectedCompanyId, setSearchParams]);

  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;

    return companies.filter((company) => {
      const companyName = resolveCompanyName(company).toLowerCase();
      const applicant = String(company.applicantName || "").toLowerCase();
      const email = String(company.applicantEmail || "").toLowerCase();
      const country = String(company.countryName || company.countryCode || "").toLowerCase();
      return (
        companyName.includes(q) ||
        applicant.includes(q) ||
        email.includes(q) ||
        country.includes(q)
      );
    });
  }, [companies, query]);

  const selectedCompany = useMemo(
    () => companies.find((company) => String(company._id) === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  const onSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSearchParams({ companyId });
  };

  const canViewAllRecords = role === "admin" || role === "master";

  return (
    <div className="max-width mx-auto p-3 md:p-4 space-y-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            MCAP Document Center
          </CardTitle>
          <CardDescription>
            {canViewAllRecords
              ? "View and manage documents across all MCAP records."
              : "View and manage documents for your MCAP records."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading MCAP records...
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No MCAP records available for document management.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-12">
              <Card className="xl:col-span-4 border shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Select Company</CardTitle>
                  <CardDescription>{filteredCompanies.length} record(s) found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by company, applicant, email, country"
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
                    {filteredCompanies.map((company) => {
                      const id = String(company._id);
                      const isSelected = selectedCompanyId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onSelectCompany(id)}
                          className={cn(
                            "w-full rounded-lg border p-3 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/40"
                          )}
                        >
                          <div className="truncate text-sm font-medium">
                            {resolveCompanyName(company)}
                          </div>
                          <div className="mt-1 truncate text-xs text-muted-foreground">
                            {company.countryName || company.countryCode || "Unknown country"}
                          </div>
                          <div className="mt-1 truncate text-xs text-muted-foreground">
                            {company.applicantName || company.applicantEmail || "No applicant info"}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="capitalize">
                              {company.status || "draft"}
                            </Badge>
                            <Badge
                              variant={String(company.paymentStatus || "").toLowerCase() === "paid" ? "default" : "outline"}
                              className="capitalize"
                            >
                              {company.paymentStatus || "unpaid"}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}

                    {filteredCompanies.length === 0 && (
                      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No records match your search.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="xl:col-span-8 space-y-3">
                {selectedCompany ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/20 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {resolveCompanyName(selectedCompany)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedCompany.countryName || selectedCompany.countryCode}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center gap-2"
                        onClick={() => navigate(`/incorporation-detail/${selectedCompany._id}`)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open detail
                      </Button>
                    </div>

                    <McapCompanyDocumentCenter
                      companyId={String(selectedCompany._id)}
                      countryCode={String(selectedCompany.countryCode || "")}
                      companyName={resolveCompanyName(selectedCompany)}
                    />
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Select a company to open its document center.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
