"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartHandshake,
  Image as ImageIcon,
  Pipette,
  Upload,
  X,
} from "lucide-react";
import { setCustomizationAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/auth-state";
import { cn } from "@/lib/utils";
import { Field, FormBanner, SubmitButton } from "./form-primitives";

interface Props {
  locale: string;
  defaultSiteName: string;
}

// ─── Colour palette ──────────────────────────────────────────────
const PRIMARY_COLORS = [
  { id: "teal", hex: "#20665c" },
  { id: "emerald", hex: "#047857" },
  { id: "navy", hex: "#1e3a8a" },
  { id: "brown", hex: "#78350f" },
  { id: "plum", hex: "#6d28d9" },
  { id: "charcoal", hex: "#1f2937" },
] as const;

const ACCENT_COLORS = [
  { id: "gold", hex: "#c18f2c" },
  { id: "amber", hex: "#f59e0b" },
  { id: "coral", hex: "#f97316" },
  { id: "rose", hex: "#e11d48" },
  { id: "sky", hex: "#0ea5e9" },
  { id: "mint", hex: "#10b981" },
] as const;

const BACKGROUND_TONES = [
  { id: "paper", hex: "#fbfaf7", label: "Warm cream" },
  { id: "snow", hex: "#ffffff", label: "Pure white" },
  { id: "mist", hex: "#f1f5f9", label: "Cool grey" },
  { id: "sand", hex: "#fdf6e3", label: "Soft sand" },
] as const;

// Each typography option references a CSS variable injected by the page.
// Latin and Arabic font are paired so the preview shows BOTH samples — users
// in either locale see how their headings would look in their language.
const TYPOGRAPHY = [
  {
    id: "modern",
    latinFamily: "var(--font-geist-sans), system-ui, sans-serif",
    arabicFamily: "var(--font-tajawal), system-ui, sans-serif",
    weight: 600,
    tracking: "-0.02em",
  },
  {
    id: "classical",
    latinFamily: "var(--font-typo-classical), Georgia, serif",
    arabicFamily: "var(--font-typo-ar-classical), serif",
    weight: 700,
    tracking: "-0.01em",
  },
  {
    id: "minimal",
    latinFamily: "var(--font-typo-minimal), system-ui, sans-serif",
    arabicFamily: "var(--font-typo-ar-minimal), system-ui, sans-serif",
    weight: 500,
    tracking: "-0.03em",
  },
  {
    id: "editorial",
    latinFamily: "var(--font-typo-editorial), Georgia, serif",
    arabicFamily: "var(--font-typo-ar-editorial), serif",
    weight: 700,
    tracking: "0",
  },
  {
    id: "display",
    latinFamily: "var(--font-typo-display), Georgia, serif",
    arabicFamily: "var(--font-typo-ar-display), serif",
    weight: 800,
    tracking: "-0.02em",
  },
] as const;

const LANGUAGES = ["en", "ar"] as const;

export function CustomizeForm({ locale, defaultSiteName }: Props) {
  const t = useTranslations("onboarding.customize");
  const tColors = useTranslations("onboarding.customize.colors");
  const tTypo = useTranslations("onboarding.customize.typography");
  const tLangs = useTranslations("onboarding.customize.languages");

  const [primaryColor, setPrimaryColor] = useState<string>(
    PRIMARY_COLORS[0].hex
  );
  const [accentColor, setAccentColor] = useState<string>(ACCENT_COLORS[0].hex);
  const [backgroundTone, setBackgroundTone] = useState<string>(
    BACKGROUND_TONES[0].hex
  );
  const [typography, setTypography] = useState<string>("modern");
  const [languages, setLanguages] = useState<string[]>(["en", "ar"]);
  const [donations, setDonations] = useState<boolean>(true);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  const [state, formAction] = useActionState(
    setCustomizationAction,
    initialAuthState
  );

  const toggleLang = (l: string) =>
    setLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  return (
    <form
      action={formAction}
      className="grid gap-10"
      encType="multipart/form-data"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="brand_color" value={primaryColor} />
      <input type="hidden" name="accent_color" value={accentColor} />
      <input type="hidden" name="background_tone" value={backgroundTone} />
      <input type="hidden" name="typography_style" value={typography} />
      {languages.map((l) => (
        <input key={l} type="hidden" name="site_languages" value={l} />
      ))}

      {state?.status === "error" && (
        <FormBanner status="error" message={state.message} />
      )}

      {/* ── SITE NAME ── */}
      <Section label={t("siteNameLabel")} hint={t("siteNameHint")}>
        <Field
          id="site_name"
          name="site_name"
          label=""
          type="text"
          placeholder={t("siteNamePlaceholder")}
          defaultValue={defaultSiteName}
          required
          errors={state?.errors?.site_name}
        />
      </Section>

      {/* ── PRIMARY COLOR ── */}
      <Section
        label={t("primaryColorLabel")}
        hint={t("primaryColorHint")}
      >
        <Swatches
          options={PRIMARY_COLORS}
          selected={primaryColor}
          onChange={setPrimaryColor}
          renderLabel={(c) => tColors(c.id)}
          customLabel={t("customColorLabel")}
        />
      </Section>

      {/* ── ACCENT COLOR ── */}
      <Section label={t("accentColorLabel")} hint={t("accentColorHint")}>
        <Swatches
          options={ACCENT_COLORS}
          selected={accentColor}
          onChange={setAccentColor}
          renderLabel={(c) => tColors(c.id)}
          customLabel={t("customColorLabel")}
        />
      </Section>

      {/* ── BACKGROUND TONE ── */}
      <Section
        label={t("backgroundToneLabel")}
        hint={t("backgroundToneHint")}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BACKGROUND_TONES.map((b) => {
            const active = backgroundTone === b.hex;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBackgroundTone(b.hex)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-start transition-all",
                  active
                    ? "border-brand shadow-card ring-1 ring-brand/20"
                    : "border-border hover:border-brand/40"
                )}
                aria-pressed={active}
              >
                <div
                  className="h-14 w-full rounded-lg border border-border"
                  style={{ background: b.hex }}
                />
                <p className="mt-3 text-xs font-semibold text-foreground">
                  {tColors(b.id)}
                </p>
                {active && (
                  <span className="absolute end-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── TYPOGRAPHY ── */}
      <Section
        label={t("typographyLabel")}
        hint={t("typographyHint")}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPOGRAPHY.map((tp, i) => {
            const active = typography === tp.id;
            return (
              <motion.button
                key={tp.id}
                type="button"
                onClick={() => setTypography(tp.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 + i * 0.05 }}
                className={cn(
                  "group relative rounded-2xl border bg-surface p-5 text-start transition-all",
                  active
                    ? "border-brand shadow-card ring-1 ring-brand/20"
                    : "border-border hover:border-brand/30 hover:shadow-soft"
                )}
                aria-pressed={active}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="text-4xl leading-none text-foreground"
                    style={{
                      fontFamily: tp.latinFamily,
                      fontWeight: tp.weight,
                      letterSpacing: tp.tracking,
                    }}
                  >
                    Aa
                  </p>
                  <p
                    dir="rtl"
                    className="text-4xl leading-none text-foreground"
                    style={{
                      fontFamily: tp.arabicFamily,
                      fontWeight: tp.weight,
                    }}
                  >
                    أب
                  </p>
                </div>
                <p
                  className="mt-2 text-sm text-foreground/80"
                  style={{
                    fontFamily: tp.latinFamily,
                    fontWeight: tp.weight,
                    letterSpacing: tp.tracking,
                  }}
                >
                  The quick brown fox
                </p>
                <p
                  dir="rtl"
                  className="mt-0.5 text-sm text-foreground/80"
                  style={{
                    fontFamily: tp.arabicFamily,
                    fontWeight: tp.weight,
                  }}
                >
                  أهلاً بك في جمعية ويب
                </p>
                <div className="mt-4 border-t border-border pt-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {tTypo(`${tp.id}.name`)}
                  </h3>
                  <p className="mt-0.5 text-xs text-foreground-soft">
                    {tTypo(`${tp.id}.desc`)}
                  </p>
                </div>
                {active && (
                  <span className="absolute end-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* ── LANGUAGES ── */}
      <Section
        label={t("languagesLabel")}
        hint={t("languagesHint")}
      >
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const active = languages.includes(l);
            return (
              <button
                key={l}
                type="button"
                onClick={() => toggleLang(l)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all",
                  active
                    ? "border-brand bg-brand text-white shadow-soft"
                    : "border-border bg-surface text-foreground-soft hover:border-brand/40 hover:text-brand"
                )}
                aria-pressed={active}
              >
                {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                {tLangs(l)}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── TAGLINE ── */}
      <Section label={t("taglineLabel")}>
        <Field
          id="tagline"
          name="tagline"
          label=""
          type="text"
          placeholder={t("taglinePlaceholder")}
          errors={state?.errors?.tagline}
        />
      </Section>

      {/* ── LOGO + FAVICON (side-by-side on desktop) ── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Section label={t("logoLabel")} hint={t("logoHint")}>
          <UploadField
            id="logo"
            inputRef={logoInputRef}
            preview={logoPreview}
            setPreview={setLogoPreview}
            uploadLabel={t("logoUpload")}
            changeLabel={t("logoChange")}
            removeLabel={t("logoRemove")}
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            previewKind="rectangle"
            error={state?.errors?.logo?.[0]}
          />
        </Section>

        <Section label={t("faviconLabel")} hint={t("faviconHint")}>
          <UploadField
            id="favicon"
            inputRef={faviconInputRef}
            preview={faviconPreview}
            setPreview={setFaviconPreview}
            uploadLabel={t("faviconUpload")}
            changeLabel={t("logoChange")}
            removeLabel={t("logoRemove")}
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            previewKind="square"
            error={state?.errors?.favicon?.[0]}
          />
        </Section>
      </div>

      {/* ── DONATIONS TOGGLE ── */}
      <Section>
        <label
          className={cn(
            "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-surface p-5 transition-colors",
            donations
              ? "border-brand/40 bg-brand-50/40"
              : "border-border hover:border-brand/30"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                donations ? "bg-brand text-white" : "bg-brand-50 text-brand"
              )}
            >
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground sm:text-base">
                {t("donationsLabel")}
              </p>
              <p className="mt-0.5 text-xs text-foreground-soft sm:text-sm">
                {t("donationsHint")}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
              donations ? "bg-brand" : "bg-border-strong"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                donations
                  ? "translate-x-5 rtl:-translate-x-5"
                  : "translate-x-0.5 rtl:-translate-x-0.5"
              )}
            />
          </span>
          <input
            type="checkbox"
            name="donations_enabled"
            className="sr-only"
            checked={donations}
            onChange={(e) => setDonations(e.target.checked)}
          />
        </label>
      </Section>

      {/* Action bar */}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/${locale}/onboarding/theme`}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground-soft transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t("back")}
        </Link>
        <SubmitButton className="h-11 sm:w-auto sm:px-8">
          {t("submit")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </SubmitButton>
      </div>
    </form>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────
function Section({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3">
      {label && (
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {hint && (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Colour swatches (with custom-picker trailing button) ────────
interface SwatchOption {
  id: string;
  hex: string;
}
function Swatches<T extends SwatchOption>({
  options,
  selected,
  onChange,
  renderLabel,
  customLabel,
}: {
  options: readonly T[];
  selected: string;
  onChange: (hex: string) => void;
  renderLabel: (option: T) => string;
  customLabel: string;
}) {
  const presetHexes = options.map((o) => o.hex);
  const isCustom = !presetHexes.includes(selected);
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-wrap items-start gap-3">
      {options.map((c) => {
        const active = selected === c.hex;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.hex)}
            className="group flex flex-col items-center gap-2 outline-none transition-transform focus-visible:scale-105"
            aria-pressed={active}
            title={renderLabel(c)}
          >
            <span
              className={cn(
                "relative inline-flex h-12 w-12 items-center justify-center rounded-full shadow-soft transition-all sm:h-14 sm:w-14",
                active
                  ? "ring-4 ring-brand/30 ring-offset-2 ring-offset-paper scale-105"
                  : "ring-1 ring-black/5 group-hover:scale-105"
              )}
              style={{ background: c.hex }}
            >
              {active && (
                <Check className="h-5 w-5 text-white" strokeWidth={3} />
              )}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {renderLabel(c)}
            </span>
          </button>
        );
      })}

      {/* ─── Custom picker ─── */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          className="group outline-none transition-transform focus-visible:scale-105"
          aria-pressed={isCustom}
          title={customLabel}
        >
          <span
            className={cn(
              "relative inline-flex h-12 w-12 items-center justify-center rounded-full transition-all sm:h-14 sm:w-14",
              isCustom
                ? "ring-4 ring-brand/30 ring-offset-2 ring-offset-paper scale-105 shadow-soft"
                : "border-2 border-dashed border-border-strong group-hover:border-brand/50 group-hover:scale-105"
            )}
            // Subtle rainbow ring when not selected, the actual chosen colour when selected
            style={
              isCustom
                ? { background: selected }
                : {
                    background:
                      "conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcf7f, #4d96ff, #b39ddb, #ff6b6b)",
                  }
            }
          >
            {isCustom ? (
              <Check className="h-5 w-5 text-white" strokeWidth={3} />
            ) : (
              <Pipette className="h-4 w-4 text-white drop-shadow" />
            )}
          </span>
        </button>
        <span
          className={cn(
            "text-[11px] font-medium",
            isCustom ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {customLabel}
          {isCustom && (
            <span
              className="ms-1 inline-block font-mono text-[10px] uppercase tracking-tight"
              dir="ltr"
            >
              {selected}
            </span>
          )}
        </span>
        <input
          ref={colorInputRef}
          type="color"
          value={isCustom ? selected : "#20665c"}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-label={customLabel}
        />
      </div>
    </div>
  );
}

// ─── Upload field (logo OR favicon) ──────────────────────────────
function UploadField({
  id,
  inputRef,
  preview,
  setPreview,
  uploadLabel,
  changeLabel,
  removeLabel,
  accept,
  previewKind,
  error,
}: {
  id: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  preview: string | null;
  setPreview: (v: string | null) => void;
  uploadLabel: string;
  changeLabel: string;
  removeLabel: string;
  accept: string;
  previewKind: "rectangle" | "square";
  error?: string;
}) {
  const onChange = (file: File | undefined) => {
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const remove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-surface p-5 sm:flex-row sm:items-center">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center border border-border",
            previewKind === "square"
              ? "h-16 w-16 rounded-lg"
              : "h-20 w-20 rounded-xl",
            preview ? "bg-white" : "bg-muted/40"
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <label
            htmlFor={id}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Upload className="h-3.5 w-3.5" />
            {preview ? changeLabel : uploadLabel}
          </label>
          <input
            id={id}
            ref={inputRef}
            name={id}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => onChange(e.target.files?.[0])}
          />
          {preview && (
            <button
              type="button"
              onClick={remove}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
              {removeLabel}
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </>
  );
}
