import type { McapConfig, McapStep, McapField } from "../configs/types";

export interface SummaryItem {
  label: string;
  value: string;
}

export interface SummarySection {
  title: string;
  items: SummaryItem[];
}

export const buildFormSummary = (config: McapConfig, formData: any, parties: any[], t: any): SummarySection[] => {
  const summary: SummarySection[] = [];
  const skipSteps = ["services", "service-agreement", "invoice", "payment", "review"];

  config.steps.forEach((step: McapStep) => {
    if (skipSteps.includes(step.id)) return;

    const items: SummaryItem[] = [];

    // Serialize basic fields
    if (step.fields && Array.isArray(step.fields)) {
      step.fields.forEach((field: McapField) => {
        if (!field.name) return;
        
        const rawValue = formData[field.name];
        if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
          let strValue = String(rawValue);
          if (Array.isArray(rawValue)) {
            strValue = rawValue.join(", ");
          } else if (typeof rawValue === "boolean") {
            strValue = rawValue ? t("common.yes", "Yes") : t("common.no", "No");
          } else if (field.options) {
             const matchedOption = field.options.find(opt => opt.value === rawValue);
             if(matchedOption) {
                 strValue = t(matchedOption.label);
             }
          }
          items.push({
            label: field.label ? t(field.label) : field.name,
            value: strValue,
          });
        }
      });
    }

    // Party Widget 
    if (step.widget === "PartiesManager") {
      if (parties && parties.length > 0) {
        parties.forEach((p, idx) => {
            const roleStr = p.roles && Array.isArray(p.roles) ? p.roles.map((r: string) => t(`mcap.roles.${r}`, r)).join(", ") : "";
            items.push({
                label: t("mcap.summary.partyIndicator", { defaultValue: `Party ${idx + 1}` }),
                value: `${p.name || p.email || 'N/A'} - [${roleStr}]`
            });
        });
      }
    }

    // Extract RepeatableSection data if any via a generic dump (a full mapping would need deep introspection of RepeatableSection definition)
    if (step.widget === "RepeatableSection" && step.widgetConfig) {
        // Quick fallback for repeatable section
        const val = formData[step.widgetConfig.modeField || "repeatableMode"];
        if(val) {
            items.push({
                label: t("mcap.summary.selectionMode", "Selection"),
                value: String(val)
            });
        }
    }

    if (items.length > 0) {
      summary.push({
        title: t(step.title),
        items,
      });
    }
  });

  return summary;
};
