import type { McapConfig } from "./types";
import { UAE_IFZA_CONFIG } from "./uae-ifza";

const cloneWithEntity = (id: string, title: string, entityType: string): McapConfig => {
  const steps = UAE_IFZA_CONFIG.steps.map((step) => {
    if (!step.fields) return step;
    return {
      ...step,
      fields: step.fields.map((field) => {
        if (field.name === "entityType") {
          return { ...field, defaultValue: entityType };
        }
        return field;
      }),
    };
  });

  return {
    ...UAE_IFZA_CONFIG,
    id,
    title,
    steps,
  };
};

export const UAE_FREEZONE_CONFIGS: McapConfig[] = [
  cloneWithEntity("uae-difc", "Dubai DIFC Free Zone Incorporation", "UAE-DIFC-FZCO"),
  cloneWithEntity("uae-dmcc", "Dubai DMCC Free Zone Incorporation", "UAE-DMCC-FZCO"),
  cloneWithEntity("uae-dwtc", "Dubai DWTC Free Zone Incorporation", "UAE-DWTC-FZCO"),
  cloneWithEntity("uae-dic", "Dubai DIC Free Zone Incorporation", "UAE-DIC-FZCO"),
  cloneWithEntity("uae-ifza-fzco", "Dubai IFZA Free Zone Incorporation", "UAE-IFZA-FZCO"),
];
