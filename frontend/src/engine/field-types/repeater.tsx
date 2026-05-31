"use client";

import { useEffect, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { FieldShell } from "./_field-shell";
import { getFieldWidget } from "./registry";
import { cn } from "@/lib/utils";
import type { FieldConfig, FieldWidgetProps } from "./types";

/**
 * Repeater — an array of sub-forms. Renders one collapsible card per item;
 * inside each card the same auto-form pipeline (FieldConfig → widget) drives
 * the sub-fields. Items can be added, removed, reordered with arrow buttons.
 *
 * Each item is its OWN React Hook Form instance — that way the sub-fields'
 * `register()` calls don't have to mangle path strings like `programs.0.title`
 * (which RHF supports but plays badly with our existing field widgets that
 * call `register(config.id)` directly).
 *
 * The outer form holds the canonical array; whenever any inner sub-form
 * changes, we sync the corresponding array slot via `setValue`.
 */
export function RepeaterField({ config }: FieldWidgetProps) {
  const { control, setValue } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: config.id,
  });

  const itemFields = config.itemFields ?? [];
  const itemDefaults = config.itemDefaults ?? buildDefaultsFromFields(itemFields);

  const min = config.min ?? 0;
  const max = config.max ?? 50;

  const canAdd = fields.length < max;
  const canRemove = fields.length > min;

  const addLabel =
    config.addLabel ?? `Add ${singularise(config.label).toLowerCase()}`;

  return (
    <FieldShell config={config}>
      <div className="grid gap-2">
        {fields.length === 0 && (
          <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
            No items yet. Click below to add the first one.
          </p>
        )}

        {fields.map((row, index) => (
          <RepeaterItem
            key={row.id}
            parentName={config.id}
            index={index}
            itemFields={itemFields}
            itemLabel={config.itemLabel}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
            canRemove={canRemove}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onRemove={() => remove(index)}
            onChange={(values) => {
              // Sync this item's slot back into the outer array. Touching the
              // exact path makes RHF treat it as a controlled change so the
              // builder's onChange listener fires.
              setValue(`${config.id}.${index}`, values, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        ))}

        {canAdd ? (
          <button
            type="button"
            onClick={() => append(itemDefaults)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-surface px-3 text-xs font-semibold text-foreground-soft transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        ) : (
          <p className="text-center text-[11px] text-muted-foreground">
            Maximum of {max} items reached.
          </p>
        )}
      </div>
    </FieldShell>
  );
}

// ────────────────────────────────────────────────────────────────────────

interface RepeaterItemProps {
  parentName: string;
  index: number;
  itemFields: FieldConfig[];
  itemLabel?: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onChange: (values: Record<string, unknown>) => void;
}

/** A single item card. Owns its own RHF form so child widgets can use the
 *  flat `register(id)` API instead of nested path strings. */
function RepeaterItem({
  parentName,
  index,
  itemFields,
  itemLabel,
  canMoveUp,
  canMoveDown,
  canRemove,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChange,
}: RepeaterItemProps) {
  const outerForm = useFormContext();
  // Current values for THIS item, watched off the outer form — used as the
  // inner sub-form's initial values + recomputed when outer changes (e.g.
  // undo restores a prior state).
  const watched = useWatch({
    control: outerForm.control,
    name: `${parentName}.${index}`,
  }) as Record<string, unknown> | undefined;

  const innerForm = useForm<Record<string, unknown>>({
    defaultValues: watched ?? buildDefaultsFromFields(itemFields),
    mode: "onChange",
  });

  // Push inner changes back to the outer array via `onChange`.
  useFormWatchSync(innerForm, onChange);

  const [open, setOpen] = useState(index === 0);

  const headerLabel = resolveItemLabel(
    itemLabel,
    index,
    watched ?? innerForm.getValues()
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {/* Header — collapsible bar */}
      <div className="flex items-center gap-1 border-b border-border bg-paper px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 truncate text-start text-xs font-semibold text-foreground"
        >
          {headerLabel}
        </button>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label="Move up"
          title="Move up"
          className={cn(
            "grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors",
            canMoveUp ? "hover:bg-muted/60 hover:text-foreground" : "opacity-30"
          )}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label="Move down"
          title="Move down"
          className={cn(
            "grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors",
            canMoveDown ? "hover:bg-muted/60 hover:text-foreground" : "opacity-30"
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Delete item"
          title="Delete item"
          className={cn(
            "grid h-7 w-7 place-items-center rounded transition-colors",
            canRemove
              ? "text-red-600 hover:bg-red-50"
              : "text-muted-foreground/40"
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body — collapsible sub-form */}
      {open && (
        <div className="p-3">
          <FormProvider {...innerForm}>
            <div className="grid gap-3.5">
              {itemFields.map((f) => {
                const Widget = getFieldWidget(f.type);
                return <Widget key={f.id} config={f} />;
              })}
            </div>
          </FormProvider>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

/** Mirror inner-form changes back to the outer array. */
function useFormWatchSync(
  form: ReturnType<typeof useForm<Record<string, unknown>>>,
  onChange: (values: Record<string, unknown>) => void
) {
  useEffect(() => {
    const sub = form.watch((values) => {
      onChange(values as Record<string, unknown>);
    });
    return () => sub.unsubscribe();
  }, [form, onChange]);
}

function resolveItemLabel(
  template: string | undefined,
  index: number,
  values: Record<string, unknown>
): string {
  const indexStr = String(index + 1);
  if (!template) return `Item ${indexStr}`;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (key === "index") return indexStr;
    const v = values[key];
    return typeof v === "string" || typeof v === "number"
      ? String(v)
      : indexStr;
  });
}

function buildDefaultsFromFields(
  fields: FieldConfig[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.id] = f.defaultValue;
  return out;
}

function singularise(label: string): string {
  // Naïve: drop trailing "s" so "Programs" → "Program", "Testimonials" →
  // "Testimonial". Good enough for the "Add X" button label.
  return label.replace(/s$/i, "");
}
