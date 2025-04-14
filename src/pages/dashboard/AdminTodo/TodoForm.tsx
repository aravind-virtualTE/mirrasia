import React from "react";
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
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { addTodoAtom } from "./adminTodoAtom";

const formSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  deadline: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const TodoForm:React.FC<{userId: string, role:string}> = ({userId, role}) => {
  const [, addTodo] = useAtom(addTodoAtom);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      deadline: null,
    },
  });

  const onSubmit = (values: FormValues) => {
    addTodo({
      userId,
      role: role,
      title: values.title,
      deadline: values.deadline ?? null,      
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-end gap-2 mb-4"
      >
        <div className="space-y-2 flex-1">
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

        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default TodoForm;