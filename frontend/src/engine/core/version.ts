import { satisfies as semverSatisfies, valid as semverValid } from "semver";

/**
 * Engine version — themes declare a `manifest.engine` semver range and we
 * refuse to render any theme that doesn't include this version.
 *
 * Bump major when introducing breaking changes to:
 *   - Section schema shape
 *   - Page content_json shape
 *   - Tokens definition shape
 *   - Renderer props contract
 *
 * Bump minor for additive, backwards-compatible changes.
 */
export const ENGINE_VERSION = "1.0.0";

/**
 * Does the engine satisfy a theme's declared `manifest.engine` range?
 * Returns false on garbage input rather than throwing.
 */
export function isCompatibleEngine(range: string | null | undefined): boolean {
  if (!range || typeof range !== "string") return false;
  if (!semverValid(ENGINE_VERSION)) return false;

  try {
    return semverSatisfies(ENGINE_VERSION, range, { includePrerelease: true });
  } catch {
    return false;
  }
}
