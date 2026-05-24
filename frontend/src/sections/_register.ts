/**
 * Section registry barrel.
 * Importing this file once (eagerly, from the engine entry point) registers
 * every code-side section component under its slug. The engine renderer
 * then resolves `section.type` → React component at render time.
 *
 * When you add a new section:
 *   1. Create `sections/{slug}/component.tsx`
 *   2. Add it to the DB via FilamentPHP or a seeder (must match slug + schema)
 *   3. Import + register it below
 */

import { registerSection } from "@/engine/component-registry";
import HeroBasic from "./hero-basic/component";
import Paragraph from "./paragraph/component";

registerSection("hero-basic", HeroBasic);
registerSection("paragraph", Paragraph);
