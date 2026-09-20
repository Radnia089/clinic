"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { normalizeDecimalInput, normalizeIntegerInput } from "@/lib/digits";
import { cn } from "@/lib/utils";

type Mode = "integer" | "decimal" | "phone";

export function DigitsInput({
  mode = "integer",
  value,
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> & {
  mode?: Mode;
  value: string;
  onValueChange: (value: string) => void;
}) {
  function handleChange(raw: string) {
    if (mode === "decimal") {
      onValueChange(normalizeDecimalInput(raw));
      return;
    }
    if (mode === "phone") {
      onValueChange(normalizeIntegerInput(raw).slice(0, 11));
      return;
    }
    onValueChange(normalizeIntegerInput(raw));
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode={mode === "decimal" ? "decimal" : "numeric"}
      dir="ltr"
      className={cn("text-left", className)}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
