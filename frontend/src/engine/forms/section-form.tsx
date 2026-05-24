"use client";

import { useEffect, useMemo } from "react";
import {
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFieldWidget } from "../field-types/registry";
import type { SectionMeta } from "../types";
import {
  fieldsToDefaultValues,
  fieldsToZodSchema,
} from "./schema-to-zod";
import { schemaToFields } from "./schema-to-fields";

interface SectionFormProps {
  section: SectionMeta;
  /** Existing settings (when editing an instance) — falls back to section defaults. */
  initialValues?: Record<string, unknown>;
  /** Fires on every valid change (used for live preview in the builder). */
  onChange?: (values: Record<string, unknown>) => void;
  /** Fires on successful submit. */
  onSubmit?: SubmitHandler<Record<string, unknown>>;
  /** Show a primary submit button. Defaults to true. */
  showSubmit?: boolean;
  submitLabel?: string;
}

/**
 * Auto-generated edit form for a section instance.
 *
 *   1. Parses the section's schema_json into a FieldConfig[]
 *   2. Builds a Zod schema from those configs (drives RHF validation)
 *   3. Renders each field via the widget registry
 *   4. Emits onChange/onSubmit upstream
 *
 * Server-rendered shell wrapping a client-rendered RHF form. The form itself
 * is "use client" because react-hook-form needs hooks.
 */
export function SectionForm({
  section,
  initialValues,
  onChange,
  onSubmit,
  showSubmit = true,
  submitLabel = "Save",
}: SectionFormProps) {
  // Field configs + Zod resolver are derived once per section change.
  const fields = useMemo(
    () => schemaToFields(section.schema, section.default_settings),
    [section]
  );

  const zodSchema = useMemo(() => fieldsToZodSchema(fields), [fields]);

  const defaultValues = useMemo(() => {
    const fromConfig = fieldsToDefaultValues(fields);
    return { ...fromConfig, ...(initialValues ?? {}) };
  }, [fields, initialValues]);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onChange",
  });

  // Forward live changes upstream (debounced is overkill at this scale)
  useEffect(() => {
    if (!onChange) return;
    const sub = form.watch((values) => {
      onChange(values as Record<string, unknown>);
    });
    return () => sub.unsubscribe();
  }, [form, onChange]);

  // Reset whenever the section identity changes (different section selected)
  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.slug]);

  const submit = onSubmit
    ? form.handleSubmit(onSubmit)
    : (e: React.FormEvent) => e.preventDefault();

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} className="grid gap-5">
        {fields.length === 0 && (
          <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            This section has no editable fields.
          </p>
        )}

        {fields.map((f) => {
          const Widget = getFieldWidget(f.type);
          return <Widget key={f.id} config={f} />;
        })}

        {showSubmit && fields.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!form.formState.isValid && form.formState.isSubmitted}
              className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-background shadow-soft transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
