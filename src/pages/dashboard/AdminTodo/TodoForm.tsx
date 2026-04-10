import React, { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { addTodoAtom } from "./adminTodoAtom";
import type { DurationUnit } from "./adminTodoAtom";

const PRESET_DURATIONS = [
  { label: "1 hour", value: "1-hours" },
  { label: "2 hours", value: "2-hours" },
  { label: "4 hours", value: "4-hours" },
  { label: "8 hours", value: "8-hours" },
  { label: "1 day", value: "1-days" },
  { label: "1 week", value: "1-weeks" },
  { label: "Custom", value: "custom" },
];

const formSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  deadline: z.date().optional().nullable(),
  durationPreset: z.string().optional().nullable(),
  customDuration: z.coerce.number().optional().nullable(),
  customDurationUnit: z.enum(["hours", "days", "weeks"]).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const TodoForm: React.FC<{ userId: string; role: string }> = ({
  userId,
  role,
}) => {
  const [, addTodo] = useAtom(addTodoAtom);
  const [isCustom, setIsCustom] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      deadline: null,
      durationPreset: null,
      customDuration: null,
      customDurationUnit: "hours",
    },
  });

  const onSubmit = (values: FormValues) => {
    let duration: number | null = null;
    let durationUnit: DurationUnit = "hours";

    if (values.durationPreset && values.durationPreset !== "") {
      if (values.durationPreset === "custom") {
        duration = values.customDuration || null;
        durationUnit = (values.customDurationUnit as DurationUnit) || "hours";
      } else {
        const [val, unit] = values.durationPreset.split("-");
        duration = parseInt(val, 10);
        durationUnit = unit as DurationUnit;
      }
    }

    addTodo({
      userId,
      role,
      title: values.title,
      deadline: values.deadline ?? null,
      duration,
      durationUnit,
    });
    form.reset();
    setIsCustom(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-wrap items-end gap-2 mb-4"
      >
        <div className="space-y-2 flex-1 min-w-[180px]">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Add a new task..."
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-auto pl-3 pr-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {field.value ? (
                        <span className="ml-2">
                          {format(field.value, "dd/MM/yyyy")}
                        </span>
                      ) : null}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={field.onChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration Preset Dropdown */}
        <FormField
          control={form.control}
          name="durationPreset"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Select
                value={field.value || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  setIsCustom(val === "custom");
                  if (val !== "custom") {
                    form.setValue("customDuration", null);
                    form.setValue("customDurationUnit", "hours");
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-[120px] h-9 text-xs">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRESET_DURATIONS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Custom Duration Inputs (shown only when "Custom" is selected) */}
        {isCustom && (
          <>
            <FormField
              control={form.control}
              name="customDuration"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Value"
                      className="w-[70px] h-9 text-xs"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customDurationUnit"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Select
                    value={field.value || "hours"}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[90px] h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default TodoForm;
