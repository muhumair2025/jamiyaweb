import { z } from "zod";

/**
 * Shape of a theme's `manifest.json` (or, in DB-driven mode, the manifest_json column).
 * The engine refuses to render any theme whose manifest doesn't parse.
 */
export const ManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  /** Semver range, e.g. ">=1.0.0 <2.0.0". Validated separately via semver.satisfies. */
  engine: z.string().min(1),
  supported_types: z.array(z.string()).min(1),
  default_pages: z.array(z.string()).optional(),
});

export type ManifestInput = z.infer<typeof ManifestSchema>;
