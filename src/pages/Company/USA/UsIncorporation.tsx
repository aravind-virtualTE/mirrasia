// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React from "react";
// import { UsaFormData, usaFormWithResetAtom } from "./UsState";

// import { FieldBase, FormConfig } from "../NewHKForm/hkIncorpo";
// import { t } from "i18next";
// import { Label } from "@/components/ui/label";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Info } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import SearchSelect from "@/components/SearchSelect";
// import { Checkbox } from "@radix-ui/react-checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// const classNames = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");


// function Field({ field, form, setForm, }: { field: FieldBase; form: any; setForm: (fn: (prev: any) => any) => void; }) {
//     const visible = field.condition ? field.condition(form) : true;
//     if (!visible) return null;

//     const set = (name: string, value: any) =>
//         setForm((prev) => ({ ...prev, [name]: value }));

//     const labelText = t(field.label as any, field.label);
//     const tooltipText = field.tooltip ? t(field.tooltip as any, field.tooltip) : undefined;
//     const placeholderText = field.placeholder
//         ? t(field.placeholder as any, field.placeholder)
//         : undefined;
//     const hintText = field.hint ? t(field.hint as any, field.hint) : undefined;

//     const labelEl = (
//         <div className="flex items-center gap-2">
//             <Label htmlFor={field.name} className="font-semibold">
//                 {labelText}
//             </Label>
//             {tooltipText && (
//                 <TooltipProvider delayDuration={0}>
//                     <Tooltip>
//                         <TooltipTrigger asChild>
//                             <Info className="size-4 text-muted-foreground" />
//                         </TooltipTrigger>
//                         <TooltipContent className="max-w-xs text-sm">
//                             {tooltipText}
//                         </TooltipContent>
//                     </Tooltip>
//                 </TooltipProvider>
//             )}
//         </div>
//     );

//     const hintEl = hintText ? (
//         <p className="text-xs text-muted-foreground mt-1">{hintText}</p>
//     ) : null;

//     const spanClass = field.colSpan === 2 ? "md:col-span-2" : "";

//     switch (field.type) {
//         case "text":
//         case "email":
//         case "number": {
//             return (
//                 <div className={classNames("grid gap-2", spanClass)}>
//                     {labelEl}
//                     <Input
//                         id={field.name}
//                         type={field.type === "number" ? "number" : field.type}
//                         placeholder={placeholderText}
//                         value={form[field.name] ?? ""}
//                         onChange={(e) => set(field.name, e.target.value)}
//                     />
//                     {hintEl}
//                 </div>
//             );
//         }
//         case "textarea": {
//             return (
//                 <div className={classNames("grid gap-2", spanClass)}>
//                     {labelEl}
//                     <Textarea
//                         id={field.name}
//                         rows={field.rows ?? 4}
//                         placeholder={placeholderText}
//                         value={form[field.name] ?? ""}
//                         onChange={(e) => set(field.name, e.target.value)}
//                     />
//                     {hintEl}
//                 </div>
//             );
//         }
//         case "select": {
//             const options = (field.options || []).map((o) => ({
//                 ...o,
//                 _label: t(o.label as any, o.label),
//             }));
//             return (
//                 <div className={classNames("grid gap-2", spanClass)}>
//                     {labelEl}
//                     <Select
//                         value={String(form[field.name] ?? "")}
//                         onValueChange={(v) => set(field.name, v)}
//                     >
//                         <SelectTrigger id={field.name}>
//                             <SelectValue
//                                 placeholder={placeholderText || t("common.select", "Select")}
//                             />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {options.map((o) => (
//                                 <SelectItem key={o.value} value={o.value}>
//                                     {o._label}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                     {hintEl}
//                 </div>
//             );
//         }
//         case "search-select": {
//             // Expect field.items to be [{ code, label }]
//             const selectedItem = form[field.name]
//                 ? field.items?.find((o: any) => o.code === form[field.name]) || null
//                 : null;

//             const handleSelect = (item: { code: string; label: string }) => {
//                 set(field.name, item.code);
//             };

//             const items = (field.items || []).map((it: any) => ({
//                 ...it,
//                 label: t(it.label as any, it.label),
//             }));

//             return (
//                 <div className={classNames("grid gap-2", spanClass)}>
//                     {labelEl}
//                     <SearchSelect
//                         items={items}
//                         placeholder={placeholderText || t("common.select", "Select")}
//                         onSelect={handleSelect}
//                         selectedItem={
//                             selectedItem
//                                 ? { ...selectedItem, label: t(selectedItem.label as any, selectedItem.label) }
//                                 : null
//                         }
//                     />
//                     {hintEl}
//                 </div>
//             );
//         }
//         case "checkbox": {
//             return (
//                 <div className={classNames("flex items-center gap-2", spanClass)}>
//                     <Checkbox
//                         id={field.name}
//                         checked={!!form[field.name]}
//                         onCheckedChange={(v) => set(field.name, !!v)}
//                     />
//                     {labelEl}
//                     {hintEl}
//                 </div>
//             );
//         }
//         case "checkbox-group": {
//             const arr: string[] = Array.isArray(form[field.name]) ? form[field.name] : [];
//             const toggle = (val: string, on: boolean) => {
//                 const next = new Set(arr);
//                 if (on) next.add(val);
//                 else next.delete(val);
//                 set(field.name, Array.from(next));
//             };
//             const options = (field.options || []).map((o) => ({
//                 ...o,
//                 _label: t(o.label as any, o.label),
//             }));
//             return (
//                 <div className={classNames("grid gap-2", spanClass)}>
//                     {labelEl}
//                     <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
//                         {options.map((o) => (
//                             <label key={o.value} className="flex items-center gap-2 rounded-md border p-2">
//                                 <Checkbox
//                                     checked={arr.includes(o.value)}
//                                     onCheckedChange={(v) => toggle(o.value, !!v)}
//                                 />
//                                 <span className="text-sm">{o._label}</span>
//                             </label>
//                         ))}
//                     </div>
//                     {hintEl}
//                 </div>
//             );
//         }
//         case "radio-group": {
//             const options = (field.options || []).map((o) => ({
//                 ...o,
//                 _label: t(o.label as any, o.label),
//             }));
//             return (
//                 <div className="flex flex-col gap-3">
//                     {labelEl}
//                     <RadioGroup
//                         value={String(form[field.name] ?? "")}
//                         onValueChange={(v) => set(field.name, v)}
//                         className="flex flex-col gap-3"
//                     >
//                         {options.map((o) => (
//                             <label
//                                 key={o.value}
//                                 className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer"
//                             >
//                                 <RadioGroupItem
//                                     value={o.value}
//                                     id={`${field.name}-${o.value}`}
//                                     className="w-4 h-4 border-gray-300 focus:ring-primary mt-0.5 shrink-0"
//                                 />
//                                 <span className="leading-relaxed">{o._label}</span>
//                             </label>
//                         ))}
//                     </RadioGroup>
//                     {hintEl}
//                 </div>
//             );
//         }
//         case "derived": {
//             const val = (field.compute ? field.compute(form) : "") ?? "";
//             return (
//                 <div className={classNames("grid gap-2", spanClass)}>
//                     {labelEl}
//                     <Input id={field.name} readOnly value={val} />
//                     {hintEl}
//                 </div>
//             );
//         }
//     }
// }

// function ConfigForm({ config }: { config: any }) {

// }

// const usIncorpConfig: FormConfig = {
//     title: "newUS.usTitle",
//     steps: [

//     ]
// }

// export default function ConfigDrivenUSAForm() {
//     React.useEffect(() => {
//         document.title = "Company Incorporation - Mirr Asia";
//     }, []);
//     return <ConfigForm config={usIncorpConfig} />;
// }