/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { McapField, RepeatableSection, RepeatableSectionWidgetConfig } from "../configs/types";
import { buildDefaultsForFields } from "./fieldDefaults";

type RepeatableWidgetProps = {
  config?: RepeatableSectionWidgetConfig;
  data: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
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
  renderField,
}: RepeatableWidgetProps) => {
  const { t } = useTranslation();

  const modeValue = config?.modeField ? data?.[config.modeField] : undefined;
  const sections = useMemo(
    () => (config ? getSectionsForMode(config, modeValue) : []),
    [config, modeValue]
  );

  if (!config) return null;

  const updateRoot = (patch: Record<string, any>) => onChange({ ...data, ...patch });

  const ensureDefaultsForItem = (fields: McapField[]) => buildDefaultsForFields(fields);

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
                  <span>{itemLabel}</span>
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
          <div>
            <Button variant="outline" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderObjectSection = (section: RepeatableSection) => {
    if (!section.fieldName) return null;
    const obj = data?.[section.fieldName] || {};

    return (
      <div className="space-y-3">
        {renderSectionHeader(section)}
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
