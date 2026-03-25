/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, QrCode, Copy, Check, Trash2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_URL } from "@/services/fetch";
import { STANDARD_FLOW_COUNTRIES } from "@/mcap/configs/registry";

const API_BASE = API_URL.replace(/\/+$/, "");

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const generateCouponCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "MA-";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

export default function CouponManagement() {
    const { t } = useTranslation();

    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Create form
    const [formCode, setFormCode] = useState(generateCouponCode());
    const [formDescription, setFormDescription] = useState("");
    const [formDiscountAmount, setFormDiscountAmount] = useState(100);
    const [formMaxUses, setFormMaxUses] = useState(0);
    const [formExpiresAt, setFormExpiresAt] = useState("");
    const [formCountryCode, setFormCountryCode] = useState("");
    const [creating, setCreating] = useState(false);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/mcap/coupons`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (data?.success) {
                setCoupons(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch coupons:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleCreate = async () => {
        if (!formCode.trim() || formDiscountAmount <= 0) {
            toast({ title: "Error", description: "Code and discount amount are required.", variant: "destructive" });
            return;
        }
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/mcap/coupons`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    code: formCode.trim().toUpperCase(),
                    description: formDescription,
                    discountAmount: formDiscountAmount,
                    currency: "USD",
                    maxUses: formMaxUses,
                    expiresAt: formExpiresAt || null,
                    countryCode: formCountryCode === "GLOBAL" ? null : (formCountryCode || null),
                }),
            });
            const data = await res.json();
            if (data?.success) {
                toast({ title: "Success", description: "Coupon created successfully." });
                setCreateOpen(false);
                setFormCode(generateCouponCode());
                setFormDescription("");
                setFormDiscountAmount(100);
                setFormMaxUses(0);
                setFormExpiresAt("");
                setFormCountryCode("");
                await fetchCoupons();
            } else {
                toast({ title: "Error", description: data?.message || "Failed to create coupon.", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Network error.", variant: "destructive" });
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (coupon: any) => {
        try {
            const res = await fetch(`${API_BASE}/mcap/coupons/${coupon._id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ isActive: !coupon.isActive }),
            });
            const data = await res.json();
            if (data?.success) {
                await fetchCoupons();
                toast({ title: "Updated", description: `Coupon ${coupon.isActive ? "deactivated" : "activated"}.` });
            }
        } catch {
            toast({ title: "Error", description: "Failed to update coupon.", variant: "destructive" });
        }
    };

    const handleDelete = async (coupon: any) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete coupon "${coupon.code}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_BASE}/mcap/coupons/${coupon._id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (data?.success) {
                await fetchCoupons();
                toast({ title: "Deleted", description: "Coupon permanently deleted." });
            }
        } catch {
            toast({ title: "Error", description: "Failed to delete coupon.", variant: "destructive" });
        }
    };

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast({ title: "Copied", description: `Code "${code}" copied to clipboard.` });
    };

    const handleViewQr = (coupon: any) => {
        setSelectedCoupon(coupon);
        setQrDialogOpen(true);
    };

    const handleDownloadQr = () => {
        if (!selectedCoupon) return;
        const svg = document.getElementById("coupon-qr-svg");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `coupon-${selectedCoupon.code}.png`;
            link.href = pngUrl;
            link.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const COUNTRIES = [
        { code: "HK", name: "Hong Kong" },
        { code: "US", name: "USA" },
        { code: "SG", name: "Singapore" },
        { code: "PA", name: "Panama" },
        { code: "PPIF", name: "PPIF" },
        { code: "CR", name: "Costa Rica" },
        { code: "UK", name: "UK" },
        { code: "UAE", name: "UAE" },
        { code: "CH", name: "Switzerland (AG/GmbH)" },
        { code: "CH_FOUNDATION", name: "Switzerland Foundation" },
        { code: "CH_LLC", name: "Switzerland LLC" },
        { code: "EE", name: "Estonia" },
        { code: "LT", name: "Lithuania" },
        { code: "HU", name: "Hungary" },
        { code: "IE", name: "Ireland" },
        { code: "AU", name: "Australia" },
    ].filter(c => STANDARD_FLOW_COUNTRIES.has(c.code));

    return (
        <div className="space-y-6 p-6 max-width mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {t("mcap.admin.coupon.title", "Coupon Management")}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        {t("mcap.admin.coupon.description", "Create and manage discount coupons with QR codes for clients.")}
                    </p>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            {t("mcap.admin.coupon.create", "Create Coupon")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("mcap.admin.coupon.createTitle", "Create New Coupon")}</DialogTitle>
                            <DialogDescription>
                                {t("mcap.admin.coupon.createDesc", "Create a discount coupon that clients can apply during payment.")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>{t("mcap.admin.coupon.code", "Coupon Code")}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formCode}
                                        onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. MIRR100"
                                        className="flex-1"
                                    />
                                    <Button variant="outline" size="sm" onClick={() => setFormCode(generateCouponCode())}>
                                        {t("mcap.admin.coupon.generate", "Generate")}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{t("mcap.admin.coupon.discountAmount", "Discount Amount (USD)")}</Label>
                                <Input
                                    type="number"
                                    value={formDiscountAmount}
                                    onChange={(e) => setFormDiscountAmount(Number(e.target.value))}
                                    min={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("mcap.admin.coupon.descriptionLabel", "Description (optional)")}</Label>
                                <Input
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="e.g. Launch promotion"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("mcap.admin.coupon.maxUses", "Max Uses (0 = unlimited)")}</Label>
                                    <Input
                                        type="number"
                                        value={formMaxUses}
                                        onChange={(e) => setFormMaxUses(Number(e.target.value))}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("mcap.admin.coupon.expiresAt", "Expires At (optional)")}</Label>
                                    <Input
                                        type="date"
                                        value={formExpiresAt}
                                        onChange={(e) => setFormExpiresAt(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{t("mcap.admin.coupon.countryCode", "Valid for Country (optional)")}</Label>
                                <Select value={formCountryCode} onValueChange={setFormCountryCode}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("mcap.admin.coupon.allCountries", "All Countries")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GLOBAL">{t("mcap.admin.coupon.allCountries", "All Countries")}</SelectItem>
                                        {COUNTRIES.map(c => (
                                            <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreate} disabled={creating} className="w-full">
                                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {t("mcap.admin.coupon.createBtn", "Create Coupon")}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Coupons Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t("mcap.admin.coupon.listTitle", "All Coupons")}</CardTitle>
                    <CardDescription>{t("mcap.admin.coupon.listDesc", "Manage existing coupons and view their QR codes.")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {t("mcap.admin.coupon.noCoupons", "No coupons yet. Create one to get started.")}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("mcap.admin.coupon.codeCol", "Code")}</TableHead>
                                        <TableHead>{t("mcap.admin.coupon.discountCol", "Discount")}</TableHead>
                                        <TableHead>{t("mcap.admin.coupon.usageCol", "Usage")}</TableHead>
                                        <TableHead>{t("mcap.admin.coupon.expiryCol", "Expires")}</TableHead>
                                        <TableHead>{t("mcap.admin.coupon.countryCol", "Country")}</TableHead>
                                        <TableHead>{t("mcap.admin.coupon.statusCol", "Status")}</TableHead>
                                        <TableHead className="text-right">{t("mcap.admin.coupon.actionsCol", "Actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coupons.map((coupon) => (
                                        <TableRow key={coupon._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm font-mono font-bold bg-muted px-2 py-0.5 rounded">{coupon.code}</code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => handleCopyCode(coupon.code, coupon._id)}
                                                    >
                                                        {copiedId === coupon._id ? (
                                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {coupon.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-green-700">
                                                    ${coupon.discountAmount} {coupon.currency}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {coupon.usedCount} / {coupon.maxUses === 0 ? "∞" : coupon.maxUses}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">{formatDate(coupon.expiresAt)}</TableCell>
                                            <TableCell>
                                                {coupon.countryCode ? (
                                                    <Badge variant="outline">{coupon.countryCode}</Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">All</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={coupon.isActive}
                                                        onCheckedChange={() => handleToggleActive(coupon)}
                                                    />
                                                    <Badge className={coupon.isActive
                                                        ? "bg-green-100 text-green-800 border-green-300"
                                                        : "bg-gray-100 text-gray-600 border-gray-300"
                                                    }>
                                                        {coupon.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewQr(coupon)}
                                                        title="View QR Code"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(coupon)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Deactivate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* QR Code Dialog */}
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("mcap.admin.coupon.qrTitle", "Coupon QR Code")}</DialogTitle>
                        <DialogDescription>
                            {t("mcap.admin.coupon.qrDesc", "Share this QR code with clients. They can scan it to apply the discount.")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCoupon && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="p-4 bg-white rounded-xl border-2 border-dashed border-primary/30 shadow-sm">
                                <QRCodeSVG
                                    id="coupon-qr-svg"
                                    value={selectedCoupon.code}
                                    size={200}
                                    level="H"
                                    includeMargin
                                />
                            </div>
                            <div className="text-center space-y-1">
                                <code className="text-xl font-mono font-bold tracking-wider">{selectedCoupon.code}</code>
                                <p className="text-sm text-muted-foreground">
                                    ${selectedCoupon.discountAmount} {selectedCoupon.currency} discount
                                </p>
                                {selectedCoupon.description && (
                                    <p className="text-xs text-muted-foreground">{selectedCoupon.description}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleCopyCode(selectedCoupon.code, selectedCoupon._id)}>
                                    <Copy className="w-4 h-4 mr-1" />
                                    {t("mcap.admin.coupon.copyCode", "Copy Code")}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownloadQr}>
                                    <Download className="w-4 h-4 mr-1" />
                                    {t("mcap.admin.coupon.downloadQr", "Download QR")}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
