/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";
import type { McapField, RepeatableSection, RepeatableSectionWidgetConfig } from "../configs/types";
import { buildDefaultsForFields } from "./fieldDefaults";
import api from "@/services/fetch";
import { toast } from "@/hooks/use-toast";

type RepeatableWidgetProps = {
  config?: RepeatableSectionWidgetConfig;
  data: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  companyId?: string | null;
  renderField: (
    field: McapField,
    value: any,
    onChange: (val: any) => void,
    dataContext: Record<string, any>,
    fieldKey?: string
  ) => ReactNode;
};

const getSectionsForMode = (
  config: RepeatableSectionWidgetConfig,
  modeValue?: string
): RepeatableSection[] => {
  if (config.modes && config.modes.length > 0 && config.modeField) {
    const match = config.modes.find((m) => m.value === modeValue);
    return match?.sections || [];
  }
  return config.sections || [];
};

export const RepeatableSectionWidget = ({
  config,
  data,
  onChange,
  companyId,
  renderField,
}: RepeatableWidgetProps) => {
  const { t } = useTranslation();
  const [invitingSectionKey, setInvitingSectionKey] = useState<string | null>(null);

  const modeValue = config?.modeField ? data?.[config.modeField] : undefined;
  const sections = useMemo(
    () => (config ? getSectionsForMode(config, modeValue) : []),
    [config, modeValue]
  );

  if (!config) return null;

  const updateRoot = (patch: Record<string, any>) => onChange({ ...data, ...patch });

  const ensureDefaultsForItem = (fields: McapField[]) => buildDefaultsForFields(fields);

  const resolvePartyType = (source: Record<string, any>, section: RepeatableSection) => {
    const invite = section.invite;
    if (!invite) return "person";
    if (invite.type) return invite.type;
    if (invite.typeKey) {
      const entityValue = String(invite.entityValue || "corporate").toLowerCase();
      const raw = String(source?.[invite.typeKey] ?? "").toLowerCase();
      return raw === entityValue ? "entity" : "person";
    }
    return "person";
  };

  const buildPartyDetails = (source: Record<string, any>, section: RepeatableSection) => {
    const invite = section.invite;
    if (!invite) return {};
    const picked =
      Array.isArray(invite.detailsKeys) && invite.detailsKeys.length > 0
        ? invite.detailsKeys.reduce<Record<string, any>>((acc, key) => {
          acc[key] = source?.[key];
          return acc;
        }, {})
        : { ...source };

    return {
      ...(picked || {}),
      sourceSection: section.fieldName || "",
      sourceRole: invite.role,
    };
  };

  const inviteListMembers = async (section: RepeatableSection, list: any[]) => {
    if (!section.fieldName || !section.invite) return;
    if (!companyId) {
      toast({
        title: t("newHk.parties.toasts.invite.failed.title", "Save required"),
        description: t("newHk.parties.toasts.invite.failed.desc", "Please save your application before inviting parties."),
        variant: "destructive",
      });
      return;
    }

    const sectionKey = section.fieldName;
    const nameKey = section.invite.nameKey || "name";
    const emailKey = section.invite.emailKey || "email";
    const phoneKey = section.invite.phoneKey || "phone";
    const statusKey = section.invite.statusKey || "status";
    const includeDcpFromKey = section.invite.includeDcpFromKey;

    const next = [...list];
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    setInvitingSectionKey(sectionKey);
    try {
      for (let idx = 0; idx < list.length; idx += 1) {
        const item = list[idx] || {};
        const email = String(item?.[emailKey] || "").trim().toLowerCase();
        if (!email) {
          skipped += 1;
          continue;
        }

        const name = String(item?.[nameKey] || "").trim();
        const phone = String(item?.[phoneKey] || "").trim();
        const roles = [section.invite.role];
        if (
          includeDcpFromKey &&
          ["true", "yes", "1"].includes(String(item?.[includeDcpFromKey] ?? "").toLowerCase())
        ) {
          roles.push("dcp");
        }

        try {
          const res = await api.post("/mcap/parties/invite", {
            companyId,
            party: {
              _id: item?.mcapPartyId || undefined,
              type: resolvePartyType(item, section),
              name: name || email,
              email,
              phone,
              roles,
              details: buildPartyDetails(item, section),
            },
          });

          if (res?.data?.success) {
            const invitedParty = res?.data?.data?.party || {};
            next[idx] = {
              ...next[idx],
              invited: true,
              inviteStatus: invitedParty.inviteStatus || "sent",
              [statusKey]: "Invited",
              mcapPartyId: invitedParty._id || next[idx]?.mcapPartyId,
            };
            sent += 1;
          } else {
            failed += 1;
          }
        } catch {
          failed += 1;
        }
      }

      if (sent > 0) {
        updateRoot({ [section.fieldName]: next });
      }

      if (sent > 0 && failed === 0) {
        toast({
          title: t("newHk.parties.toasts.invite.success.title", "Invite Sent"),
          description: t("newHk.parties.toasts.invite.success.desc", `KYC invite sent (${sent})`),
        });
      } else if (sent > 0) {
        toast({
          title: t("newHk.parties.toasts.invite.success.title", "Invite Sent"),
          description: `Invited: ${sent}, Failed: ${failed}, Skipped (no email): ${skipped}`,
        });
      } else {
        toast({
          title: t("newHk.parties.toasts.invite.failed.title", "Invite Failed"),
          description: skipped > 0
            ? `No valid email entries to invite. Skipped: ${skipped}`
            : t("newHk.parties.toasts.invite.failed.desc", "Could not send invite"),
          variant: "destructive",
        });
      }
    } finally {
      setInvitingSectionKey(null);
    }
  };

  const inviteObjectMember = async (section: RepeatableSection, obj: Record<string, any>) => {
    if (!section.fieldName || !section.invite) return;
    if (!companyId) {
      toast({
        title: t("newHk.parties.toasts.invite.failed.title", "Save required"),
        description: t("newHk.parties.toasts.invite.failed.desc", "Please save your application before inviting parties."),
        variant: "destructive",
      });
      return;
    }

    const sectionKey = section.fieldName;
    const nameKey = section.invite.nameKey || "name";
    const emailKey = section.invite.emailKey || "email";
    const phoneKey = section.invite.phoneKey || "phone";
    const statusKey = section.invite.statusKey || "status";

    const email = String(obj?.[emailKey] || "").trim().toLowerCase();
    if (!email) {
      toast({
        title: t("newHk.parties.toasts.invalidEmail.title", "Missing email"),
        description: t("newHk.parties.toasts.invalidEmail.desc", "Please enter an email before sending an invite."),
        variant: "destructive",
      });
      return;
    }

    setInvitingSectionKey(sectionKey);
    try {
      const name = String(obj?.[nameKey] || "").trim();
      const phone = String(obj?.[phoneKey] || "").trim();
      const res = await api.post("/mcap/parties/invite", {
        companyId,
        party: {
          _id: obj?.mcapPartyId || undefined,
          type: resolvePartyType(obj, section),
          name: name || email,
          email,
          phone,
          roles: [section.invite.role],
          details: buildPartyDetails(obj, section),
        },
      });

      if (res?.data?.success) {
        const invitedParty = res?.data?.data?.party || {};
        updateRoot({
          [section.fieldName]: {
            ...(obj || {}),
            invited: true,
            inviteStatus: invitedParty.inviteStatus || "sent",
            [statusKey]: "Invited",
            mcapPartyId: invitedParty._id || obj?.mcapPartyId,
          },
        });
        toast({
          title: t("newHk.parties.toasts.invite.success.title", "Invite Sent"),
          description: t("newHk.parties.toasts.invite.success.desc", "KYC invite sent."),
        });
        return;
      }

      toast({
        title: t("newHk.parties.toasts.invite.failed.title", "Invite Failed"),
        description: t("newHk.parties.toasts.invite.failed.desc", "Could not send invite"),
        variant: "destructive",
      });
    } catch {
      toast({
        title: t("newHk.parties.toasts.invite.failed.title", "Invite Failed"),
        description: t("newHk.parties.toasts.invite.failed.desc", "Could not send invite"),
        variant: "destructive",
      });
    } finally {
      setInvitingSectionKey(null);
    }
  };

  const renderSectionHeader = (section: RepeatableSection) => {
    if (!section.title && !section.description) return null;
    return (
      <div className="space-y-1">
        {section.title && (
          <div className="text-sm font-semibold">{t(section.title, section.title)}</div>
        )}
        {section.description && (
          <div className="text-xs text-muted-foreground">
            {t(section.description, section.description)}
          </div>
        )}
      </div>
    );
  };

  const renderListSection = (section: RepeatableSection) => {
    if (!section.fieldName) return null;
    const list = Array.isArray(data?.[section.fieldName]) ? data[section.fieldName] : [];

    const addLabel = section.addLabel ? t(section.addLabel, section.addLabel) : t("common.add", "Add");
    const canRemove = (section.allowRemove ?? true) && list.length > (section.minItems ?? 0);
    const canAdd = section.allowRemove !== false || (section.minItems ?? 0) === 0;
    const statusKey = section.invite?.statusKey || "status";
    const isInviting = invitingSectionKey === section.fieldName;
    const inviteLabel = section.invite?.label
      ? t(section.invite.label, section.invite.label)
      : t("newHk.parties.buttons.invite", "Invite");

    const handleAdd = () => {
      const nextItem = ensureDefaultsForItem(section.itemFields || []);
      updateRoot({ [section.fieldName as string]: [...list, nextItem] });
    };

    const handleRemove = (idx: number) => {
      if (!canRemove) return;
      const next = list.filter((_: any, i: number) => i !== idx);
      updateRoot({ [section.fieldName as string]: next });
    };

    return (
      <div className="space-y-3">
        {renderSectionHeader(section)}
        {list.map((item: any, idx: number) => {
          const itemTitle = section.title ? t(section.title, section.title) : section.fieldName || "Item";
          const itemLabel = section.itemLabel
            ? t(section.itemLabel, { n: idx + 1, title: itemTitle })
            : `${itemTitle} ${idx + 1}`;

          return (
            <Card key={`${section.fieldName}-${idx}`} className="border">
              <CardHeader className="py-2.5">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>{itemLabel}</span>
                    {(item?.[statusKey] || item?.inviteStatus || item?.invited) && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {String(item?.[statusKey] || item?.inviteStatus || "Invited")}
                      </span>
                    )}
                  </div>
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(idx)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={t("common.remove", "Remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {section.itemFields.map((field, fieldIdx) =>
                  renderField(
                    field,
                    item?.[field.name || ""],
                    (val) => {
                      const next = [...list];
                      next[idx] = { ...(next[idx] || {}), [field.name as string]: val };
                      updateRoot({ [section.fieldName as string]: next });
                    },
                    { ...data, ...item },
                    `${section.fieldName}-${idx}-${field.name || fieldIdx}`
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
        {canAdd && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
            {section.invite && (
              <Button
                onClick={() => inviteListMembers(section, list)}
                disabled={isInviting}
                className="gap-2"
              >
                {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isInviting ? t("newHk.buttons.saving", "Saving...") : inviteLabel}
              </Button>
            )}
          </div>
        )}
        {!canAdd && section.invite && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => inviteListMembers(section, list)}
              disabled={isInviting}
              className="gap-2"
            >
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isInviting ? t("newHk.buttons.saving", "Saving...") : inviteLabel}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderObjectSection = (section: RepeatableSection) => {
    if (!section.fieldName) return null;
    const obj = data?.[section.fieldName] || {};
    const isInviting = invitingSectionKey === section.fieldName;
    const inviteLabel = section.invite?.label
      ? t(section.invite.label, section.invite.label)
      : t("newHk.parties.buttons.invite", "Invite");
    const statusKey = section.invite?.statusKey || "status";
    const statusText = obj?.[statusKey] || obj?.inviteStatus || (obj?.invited ? "Invited" : "");

    return (
      <div className="space-y-3">
        {renderSectionHeader(section)}
        {statusText && (
          <div className="text-xs text-muted-foreground">
            {t("newHk.parties.buttons.invite", "Invite")}: {String(statusText)}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {section.itemFields.map((field, fieldIdx) =>
            renderField(
              field,
              obj?.[field.name || ""],
              (val) => updateRoot({ [section.fieldName as string]: { ...obj, [field.name as string]: val } }),
              { ...data, ...obj },
              `${section.fieldName}-${field.name || fieldIdx}`
            )
          )}
        </div>
        {section.invite && (
          <div>
            <Button
              onClick={() => inviteObjectMember(section, obj)}
              disabled={isInviting}
              className="gap-2"
            >
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isInviting ? t("newHk.buttons.saving", "Saving...") : inviteLabel}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {config.preFields && config.preFields.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {config.preFields.map((field, idx) =>
            renderField(
              field,
              field.name ? data?.[field.name] : undefined,
              (val) => field.name && updateRoot({ [field.name as string]: val }),
              data,
              `pre-${field.name || idx}`
            )
          )}
        </div>
      )}

      {sections.map((section, idx) => {
        if (section.condition && !section.condition(data)) return null;
        if (section.kind === "object") return <div key={`section-${idx}`}>{renderObjectSection(section)}</div>;
        return <div key={`section-${idx}`}>{renderListSection(section)}</div>;
      })}
    </div>
  );
};
