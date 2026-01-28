/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAtom } from 'jotai';
import { costaRicaFormAtom } from './costaState';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, ChevronDown, ChevronUp, HelpCircle, UserIcon, Users, X, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { t } from 'i18next';
import { isValidEmail } from '@/middleware';
import { sendInviteToShDir } from '@/services/dataFetch';

const SHARE_TYPES = [
  { id: 'ordinary', label: 'Ordinary Shares' },
  { id: 'preference', label: 'Preference Shares' },
] as const;

type ShareTypeId = typeof SHARE_TYPES[number]['id'];


// const YES_NO = [
//   { id: 'yes', value: 'Yes' },
//   { id: 'no', value: 'No' },
// ] as const;

// type YesNoOption = { id: 'yes' | 'no'; value: string };

type ShareholderDirectorItem = {
  name: string;
  email: string;
  phone: string;
  shares: number;
  // isLegalPerson: YesNoOption;
  typeOfShare: ShareTypeId;
  isDcp: boolean;
  status?: 'Invited' | 'Not Invited' | '';
};

const DEFAULT_SHAREHOLDER: ShareholderDirectorItem = {
  name: '',
  email: '',
  phone: '',
  shares: 0,
  // isLegalPerson: { id: 'no', value: 'No' },
  typeOfShare: 'ordinary',
  isDcp: false,
  status: '',
};

export const PartiesManager = () => {
  const [formData, setFormData] = useAtom(costaRicaFormAtom);
  const [expandedSH, setExpandedSH] = React.useState<number | null>(null);
  const [isInviting, setIsInviting] = React.useState(false);

  // Get shareholders from form data
  const shareholders: ShareholderDirectorItem[] = Array.isArray(formData.shareHolders)
    ? (formData.shareHolders as ShareholderDirectorItem[]).map((s: any) => ({
      name: s.name ?? '',
      email: s.email ?? '',
      phone: s.phone ?? '',
      shares: Number(s.shares ?? 0),
      isLegalPerson: s.isLegalPerson?.id ? s.isLegalPerson : { id: 'no', value: 'No' },
      typeOfShare: (s.typeOfShare as ShareTypeId) || 'ordinary',
      isDcp: s.isDcp ?? false,
      status: s.status ?? '',
    }))
    : [{ ...DEFAULT_SHAREHOLDER }];

  const setShareholders = (next: ShareholderDirectorItem[]) => {
    setFormData((prev: any) => ({ ...prev, shareHolders: next }));
  };

  // Calculate share totals
  const totalShares = formData.shareCount === 'other'
    ? Number(formData.shareOther || 0)
    : Number(formData.shareCount || 10000);

  const allocatedShares = shareholders.reduce((s, p) => s + (Number(p.shares) || 0), 0);

  // Patch helper
  const patchShareholder = (i: number, updates: Partial<ShareholderDirectorItem>) => {
    const next = [...shareholders];
    next[i] = { ...next[i], ...updates };
    setShareholders(next);
  };

  // Add/remove
  const addShareholder = () => {
    const next = [...shareholders, { ...DEFAULT_SHAREHOLDER }];
    setShareholders(next);
    setExpandedSH(next.length - 1);
  };

  const removeShareholder = (i: number) => {
    const next = shareholders.filter((_, idx) => idx !== i);
    setShareholders(next);
    if (expandedSH === i) setExpandedSH(null);
  };

  // Send invitations (mock implementation)
  const sendInvites = async () => {
    const validEmails = shareholders.filter(
      (p) => p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)
    );

    if (!validEmails.length) {
      toast({
        title: 'No valid emails',
        description: 'Add at least one valid email to send invites.',
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);

    const extractedData = shareholders.map((item) => {
      const { name, email, isDcp } = item;
      if (!isValidEmail(email)) {
        toast({
          title: t("newHk.parties.toasts.invalidEmail.title"),
          description: t("newHk.parties.toasts.invalidEmail.desc", { name, email }),
        });
      }
      return { name, email, isDcp };
    });

    const payload = { _id: formData._id || "", inviteData: extractedData, country: "CR" };
    try {
      const response = await sendInviteToShDir(payload);
      if (response.summary.successful > 0) {
        toast({
          title: 'Invitations Sent',
          description: `${response.summary.successful} invitation(s) sent successfully.`,
        });
        setShareholders(
        shareholders.map((p) => ({
          ...p,
          status: p.email ? 'Invited' : p.status,
        }))
      );
      }
      if (response.summary.alreadyExists > 0) {
        toast({
          title: t("newHk.parties.toasts.invite.exists.title"),
          description: t("newHk.parties.toasts.invite.exists.desc"),
        });
        setShareholders(
        shareholders.map((p) => ({
          ...p,
          status: p.email ? 'Invited' : p.status,
        }))
      );
      }
      if (response.summary.failed > 0) {
        toast({
          title: t("newHk.parties.toasts.invite.failed.title"),
          description: t("newHk.parties.toasts.invite.failed.desc"),
        });
      }
      
    } catch (e) {
      console.log("Er", e)
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Shareholders / Directors / DCP</h3>
        </div>
        <div className="text-right">
          <p
            className={cn(
              'text-sm',
              totalShares > 0
                ? allocatedShares === totalShares
                  ? 'text-green-600'
                  : allocatedShares > totalShares
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                : 'text-muted-foreground'
            )}
          >
            Allocated {allocatedShares.toLocaleString()} / {totalShares.toLocaleString()} shares
          </p>
        </div>
      </div>

      {/* Shareholders/Directors list */}
      <div className="space-y-2">
        {shareholders.map((p, i) => {
          const isExpanded = expandedSH === i;
          const shareTypeLabel = SHARE_TYPES.find((s) => s.id === p.typeOfShare)?.label;

          return (
            <Card key={`sh-${i}`} className="overflow-hidden transition-all hover:shadow-md">
              {/* Compact Header */}
              <div
                className="p-3 cursor-pointer flex items-center justify-between hover:bg-secondary/50"
                onClick={() => setExpandedSH(isExpanded ? null : i)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {p.name || 'New Shareholder/Director'}
                      </span>
                      {p.status && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            p.status === 'Invited'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          )}
                        >
                          {p.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {p.email || 'No email'}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-foreground">{p.shares.toLocaleString()}</div>
                    {shareTypeLabel && <div className="text-xs text-muted-foreground">{shareTypeLabel}</div>}
                  </div>
                </div>

                <button className="ml-4 p-1 hover:bg-secondary rounded" type="button">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4 border-t bg-secondary/30">
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Name */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs text-muted-foreground mb-1">Name</Label>
                      <Input
                        value={p.name}
                        onChange={(e) => patchShareholder(i, { name: e.target.value })}
                        className="h-9"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs text-muted-foreground mb-1">Email</Label>
                      <Input
                        type="email"
                        value={p.email}
                        onChange={(e) => patchShareholder(i, { email: e.target.value })}
                        className="h-9"
                      />
                    </div>

                    {/* Phone */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs text-muted-foreground mb-1">Phone</Label>
                      <Input
                        value={p.phone}
                        onChange={(e) => patchShareholder(i, { phone: e.target.value })}
                        className="h-9"
                      />
                    </div>

                    {/* Shares */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs text-muted-foreground mb-1">Number of Shares</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={Number.isFinite(p.shares) ? p.shares : 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          patchShareholder(i, { shares: Number.isFinite(val) ? val : 0 });
                        }}
                        className="h-9"
                      />
                    </div>

                    {/* Type of Share */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs text-muted-foreground mb-1">Type of Shares</Label>
                      <Select
                        value={p.typeOfShare || 'ordinary'}
                        onValueChange={(id) => patchShareholder(i, { typeOfShare: id as ShareTypeId })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {SHARE_TYPES.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Is Legal Person */}
                    {/* <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs text-muted-foreground mb-1">Is Legal Person?</Label>
                      <Select
                        value={p.isLegalPerson?.id || 'no'}
                        onValueChange={(id: 'yes' | 'no') => {
                          const selected = YES_NO.find((o) => o.id === id)!;
                          patchShareholder(i, { isLegalPerson: selected });
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {YES_NO.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div> */}

                    {/* Is DCP */}
                    <div className="col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-xs text-muted-foreground">Will act as DCP?</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Designated Contact Person for compliance/communication.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        value={String(p.isDcp ?? false)}
                        onValueChange={(v) => patchShareholder(i, { isDcp: v === 'true' })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Remove */}
                    <div className="col-span-2 flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShareholder(i)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button onClick={addShareholder} variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Shareholder/Director
        </Button>

        <Button
          onClick={sendInvites}
          variant="default"
          className="flex items-center gap-2"
          disabled={isInviting}
        >
          {isInviting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="ml-1">Send Invitations</span>
        </Button>
      </div>
    </div>
  );
};
