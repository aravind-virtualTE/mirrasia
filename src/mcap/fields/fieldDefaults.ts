import type { McapField } from "../configs/types";

export const getDefaultValueForField = (field: McapField) => {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "checkbox") return false;
  if (field.type === "checkbox-group") return [];
  if (field.type === "select" || field.type === "radio" || field.type === "radio-group") return "";
  if (field.type === "text" || field.type === "email" || field.type === "number" || field.type === "textarea") return "";
  return undefined;
};

export const buildDefaultsForFields = (fields: McapField[]) => {
  const next: Record<string, any> = {};
  fields.forEach((field) => {
    if (!field.name) return;
    const value = getDefaultValueForField(field);
    if (value !== undefined) next[field.name] = value;
  });
  return next;
};
