/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil } from "lucide-react";
import { getMcapCompanies } from "@/services/dataFetch";
import { MCAP_CONFIG_MAP } from "@/mcap/configs/registry";
import api from "@/services/fetch";

interface TokenData {
  userId: string;
  role: string;
}

const resolveCompanyName = (entry: any) => {
  const data = entry?.data || {};
  return (
    data.companyName_1 ||
    data.name1 ||
    data.foundationNameEn ||
    data.companyName1 ||
    data.companyName2 ||
    data.companyName3 ||
    data.companyName_2 ||
    data.companyName_3 ||
    data.companyName ||
    data.companyNameEn ||
    entry?.countryName ||
    "Untitled"
  );
};

export default function McapUserDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);

  const token = useMemo(() => ((localStorage.getItem("token") as string) ?? ""), []);
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
    (async () => {
      setIsLoading(true);
      const res = await getMcapCompanies(role === "user" ? { userId } : undefined);
      const data = res?.data || [];
      if (active) {
        setItems(data);
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, role]);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoadingInvites(true);
      try {
        const res = await api.get("/mcap/invites/me");
        if (active) setInvites(res?.data?.data || []);
      } catch {
        if (active) setInvites([]);
      } finally {
        if (active) setIsLoadingInvites(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-width mx-auto p-4 md:p-6 space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>{t("mcap.dashboard.title", "MCAP Applications")}</CardTitle>
          <CardDescription>{t("mcap.dashboard.desc", "Track and continue your unified incorporation applications.")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("mcap.dashboard.loading", "Loading applications...")}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t("mcap.dashboard.empty", "No MCAP applications yet.")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("mcap.dashboard.columns.company", "Company")}</TableHead>
                  <TableHead>{t("mcap.dashboard.columns.country", "Country")}</TableHead>
                  <TableHead>{t("mcap.dashboard.columns.status", "Status")}</TableHead>
                  <TableHead>{t("mcap.dashboard.columns.payment", "Payment")}</TableHead>
                  <TableHead className="text-right">{t("mcap.dashboard.columns.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((entry) => {
                  const config = MCAP_CONFIG_MAP[entry?.countryCode] || MCAP_CONFIG_MAP[entry?.id];
                  // const canEdit = entry?.paymentStatus !== "paid";
                  return (
                    <TableRow
                      key={entry?._id}
                      onClick={() => navigate(`/mcap-detail/${entry._id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {resolveCompanyName(entry)}
                      </TableCell>

                      <TableCell>
                        {entry?.countryName || config?.countryName || entry?.countryCode}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {entry?.status || "Draft"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant={entry?.paymentStatus === "paid" ? "default" : "outline"}>
                          {entry?.paymentStatus || "unpaid"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            // disabled={!canEdit}
                            onClick={() => navigate(`/mcap?companyId=${entry._id}`)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {t("mcap.dashboard.actions.edit", "Edit")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>My Invitations</CardTitle>
          <CardDescription>Complete KYC for companies that invited you.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvites ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading invitations...
            </div>
          ) : invites.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No pending invitations.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => {
                  const company = inv.company || {};
                  const isDcp = (inv.roles || []).includes("dcp");
                  return (
                    <TableRow
                      key={inv._id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/mcap-parties?partyId=${inv._id}&mode=detail`)}
                    >
                      <TableCell className="font-medium">{company.companyName || company.countryName || "Company"}</TableCell>
                      <TableCell>{company.countryName || company.countryCode || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{(inv.roles || []).join(", ")}</TableCell>
                      <TableCell>
                        <Badge variant={inv.kycStatus === "approved" ? "default" : "outline"} className="capitalize">
                          {inv.kycStatus || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {inv.kycExpiresAt ? new Date(inv.kycExpiresAt).toISOString().slice(0, 10) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/mcap-parties?partyId=${inv._id}&mode=edit`);
                            }}
                          >
                            Complete KYC
                          </Button>
                          {isDcp && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/mcap?companyId=${company._id || company.id || ""}`);
                              }}
                            >
                              Open Incorporation
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
