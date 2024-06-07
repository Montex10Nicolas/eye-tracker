"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type NextResponse } from "next/server";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export type FormSchemaType = typeof FormSchema;

export default function InputForm(props: {
  submit: (
    formData: z.infer<FormSchemaType>,
  ) => Promise<readonly [number, string]>;
}) {
  const { submit } = props;
  const form = useForm<z.infer<FormSchemaType>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const inputTypePassword = showPassword ? "text" : "password";

  async function onSubmit(data: z.infer<FormSchemaType>) {
    const [status, statusText] = await submit(data);
    if (status === 200) return;

    toast(status, {
      description: statusText,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full space-y-6 text-black"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Input type={inputTypePassword} {...field} />
                  <Button
                    className="w-32"
                    onClick={() => setShowPassword((c) => !c)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
