import type { ComponentType } from "react";
import { BooleanField } from "./boolean";
import { ColorField } from "./color";
import { ImageField } from "./image";
import { NumberField } from "./number";
import { SelectField } from "./select";
import { TextField } from "./text";
import { TextareaField } from "./textarea";
import { UrlField } from "./url";
import type { FieldType, FieldWidgetProps } from "./types";

/**
 * Maps a resolved field type (from schema-to-fields) to the React widget that
 * renders it. To add a new field type:
 *
 *   1. Add the slug to `FieldType` in `types.ts`
 *   2. Build the widget component (use FieldShell + react-hook-form)
 *   3. Register it here
 *   4. Teach `schemaToFields` how to infer the new type
 */
const WIDGETS: Record<FieldType, ComponentType<FieldWidgetProps>> = {
  text: TextField,
  textarea: TextareaField,
  url: UrlField,
  number: NumberField,
  boolean: BooleanField,
  color: ColorField,
  image: ImageField,
  select: SelectField,
};

export function getFieldWidget(
  type: FieldType
): ComponentType<FieldWidgetProps> {
  return WIDGETS[type] ?? TextField;
}
