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
  cloneWithEntity("uae-difc", "mcap.uae.freezones.titles.difc", "UAE-DIFC-FZCO"),
  cloneWithEntity("uae-dmcc", "mcap.uae.freezones.titles.dmcc", "UAE-DMCC-FZCO"),
  cloneWithEntity("uae-dwtc", "mcap.uae.freezones.titles.dwtc", "UAE-DWTC-FZCO"),
  cloneWithEntity("uae-dic", "mcap.uae.freezones.titles.dic", "UAE-DIC-FZCO"),
  cloneWithEntity("uae-ifza-fzco", "mcap.uae.freezones.titles.ifzaFzco", "UAE-IFZA-FZCO"),
];
