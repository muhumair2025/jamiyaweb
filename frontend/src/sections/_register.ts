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
import HeroBasic, { heroBasicVariants } from "./hero-basic/component";
import Paragraph from "./paragraph/component";
import FeatureGrid from "./feature-grid/component";
import CtaBand from "./cta-band/component";
import StatsCounter from "./stats-counter/component";
import ProgramsGrid from "./programs-grid/component";
import Testimonials from "./testimonials/component";
import DonationWidget from "./donation-widget/component";
import ContactForm from "./contact-form/component";
import SiteHeader from "./site-header/component";
import SiteFooter from "./site-footer/component";
import Team from "./team/component";
import Faq from "./faq/component";
import ImageGallery from "./image-gallery/component";
import SectionDivider from "./section-divider/component";
import ServicePillars from "./service-pillars/component";
import PartnersStrip from "./partners-strip/component";

registerSection("hero-basic", HeroBasic, { variants: heroBasicVariants });
registerSection("paragraph", Paragraph);
registerSection("feature-grid", FeatureGrid);
registerSection("cta-band", CtaBand);
registerSection("stats-counter", StatsCounter);
registerSection("programs-grid", ProgramsGrid);
registerSection("testimonials", Testimonials);
registerSection("donation-widget", DonationWidget);
registerSection("contact-form", ContactForm);
registerSection("site-header", SiteHeader);
registerSection("site-footer", SiteFooter);
registerSection("team", Team);
registerSection("faq", Faq);
registerSection("image-gallery", ImageGallery);
registerSection("section-divider", SectionDivider);
registerSection("service-pillars", ServicePillars);
registerSection("partners-strip", PartnersStrip);
