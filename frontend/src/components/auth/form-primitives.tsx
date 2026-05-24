"use client";

import { useFormStatus } from "react-dom";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Submit button with built-in pending state ────────────────
export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background shadow-soft transition-all hover:bg-brand hover:shadow-card disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ─── Labelled text input ──────────────────────────────────────
interface FieldProps {
  id: string;
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  readOnly?: boolean;
  errors?: string[];
  rightAddon?: React.ReactNode;
  hint?: string;
}

export function Field({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
  defaultValue,
  readOnly,
  errors,
  rightAddon,
  hint,
}: FieldProps) {
  const hasError = !!errors?.length;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
        {rightAddon}
      </div>
      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        readOnly={readOnly}
        aria-invalid={hasError}
        className={cn(
          "h-11 rounded-lg border bg-surface px-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70",
          "focus:ring-4",
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-border focus:border-brand focus:ring-brand/10",
          readOnly && "bg-muted/40 text-muted-foreground"
        )}
      />
      {hasError ? (
        <p className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errors![0]}</span>
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────
interface SelectFieldProps {
  id: string;
  name?: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  errors?: string[];
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  id,
  name,
  label,
  required,
  defaultValue,
  errors,
  options,
  placeholder,
}: SelectFieldProps) {
  const hasError = !!errors?.length;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name ?? id}
          required={required}
          defaultValue={defaultValue ?? ""}
          aria-invalid={hasError}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border bg-surface px-3 pe-9 text-sm outline-none transition-all",
            "focus:ring-4",
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-border focus:border-brand focus:ring-brand/10",
            !defaultValue && "text-muted-foreground/70"
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-foreground">
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {hasError && (
        <p className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errors![0]}</span>
        </p>
      )}
    </div>
  );
}

// ─── Phone field with country-code select ─────────────────────
interface PhoneFieldProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  errors?: string[];
  defaultCode?: string;
}

const PHONE_CODES = [
  { code: "+92", flag: "🇵🇰" },
  { code: "+91", flag: "🇮🇳" },
  { code: "+880", flag: "🇧🇩" },
  { code: "+62", flag: "🇮🇩" },
  { code: "+966", flag: "🇸🇦" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+20", flag: "🇪🇬" },
  { code: "+90", flag: "🇹🇷" },
  { code: "+60", flag: "🇲🇾" },
  { code: "+44", flag: "🇬🇧" },
  { code: "+1", flag: "🇺🇸" },
  { code: "+27", flag: "🇿🇦" },
];

export function PhoneField({
  id,
  label,
  required,
  placeholder,
  errors,
  defaultCode = "+92",
}: PhoneFieldProps) {
  const hasError = !!errors?.length;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <div
        className={cn(
          "flex h-11 rounded-lg border bg-surface transition-all focus-within:ring-4",
          hasError
            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
            : "border-border focus-within:border-brand focus-within:ring-brand/10"
        )}
        dir="ltr"
      >
        <select
          name="phone_code"
          defaultValue={defaultCode}
          aria-label="Country code"
          className="h-full appearance-none rounded-s-lg border-e border-border bg-transparent ps-3 pe-7 text-sm font-medium text-foreground outline-none"
        >
          {PHONE_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          id={id}
          name={id}
          type="tel"
          inputMode="tel"
          required={required}
          placeholder={placeholder}
          autoComplete="tel-national"
          className="h-full flex-1 rounded-e-lg bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      {hasError && (
        <p className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errors![0]}</span>
        </p>
      )}
    </div>
  );
}

// ─── Top-of-form banner for global errors / success ───────────
export function FormBanner({
  status,
  message,
}: {
  status: "error" | "success";
  message?: string;
}) {
  if (!message) return null;
  const Icon = status === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={status === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 text-sm",
        status === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
