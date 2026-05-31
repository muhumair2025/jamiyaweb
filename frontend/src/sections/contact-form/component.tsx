"use client";

import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { nullSafeBoolean, nullSafeString } from "../_helpers";

/**
 * Contact form section. Renders a form, POSTs to the public submission
 * endpoint, and shows a success state when accepted.
 *
 * Schema-driven field visibility — the editor toggles which fields appear,
 * which are required, and the success copy. Anti-spam handled server-side
 * (honeypot + rate limit) but the form always includes the hidden `_hp`
 * input for the server to validate.
 */

export const ContactFormSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("Get in touch"),
  subheading: nullSafeString(""),
  show_phone: nullSafeBoolean(true),
  show_subject: nullSafeBoolean(true),
  require_phone: nullSafeBoolean(false),
  submit_label: nullSafeString("Send message"),
  success_heading: nullSafeString("Thanks — we got your message"),
  success_message: nullSafeString("We'll reply within 1–2 business days."),
  contact_email: nullSafeString(""),
  contact_phone: nullSafeString(""),
});

export type ContactFormSettings = z.infer<typeof ContactFormSchema>;

export default function ContactForm({
  settings,
  sectionId,
}: SectionComponentProps<ContactFormSettings>) {
  const safe = ContactFormSchema.parse(settings);

  return (
    <EngineElement
      el="background"
      kind="background"
      as="section"
      className="px-6 py-16 sm:py-20"
      style={{
        background: `var(--jw-section-bg, ${tokenVar("color.background")})`,
        color: `var(--jw-section-text, ${tokenVar("color.foreground")})`,
      }}
    >
      <EngineElement
        el="container"
        kind="container"
        className="mx-auto max-w-3xl"
      >
        <header className="text-center">
          {safe.eyebrow && (
            <EngineElement
              el="eyebrow"
              kind="text"
              as="p"
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: tokenVar("color.primary") }}
            >
              {safe.eyebrow}
            </EngineElement>
          )}
          {safe.heading && (
            <EngineElement
              el="heading"
              kind="heading"
              as="h2"
              className="mt-3 text-balance font-semibold tracking-tight"
              style={{
                fontFamily: "var(--jw-font-heading, inherit)",
                color: "var(--jw-section-heading, inherit)",
                fontSize: "calc(2rem * var(--jw-section-heading-scale, 1))",
              }}
            >
              {safe.heading}
            </EngineElement>
          )}
          {safe.subheading && (
            <EngineElement
              el="subheading"
              kind="text"
              as="p"
              className="mt-3 opacity-80"
              style={{
                fontSize: "calc(1rem * var(--jw-section-body-scale, 1))",
              }}
            >
              {safe.subheading}
            </EngineElement>
          )}
        </header>

        <ContactFormBody settings={safe} sectionId={sectionId} />

        {(safe.contact_email || safe.contact_phone) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm opacity-80">
            {safe.contact_email && (
              <a
                href={`mailto:${safe.contact_email}`}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {safe.contact_email}
              </a>
            )}
            {safe.contact_phone && (
              <span dir="ltr" className="font-mono text-xs">
                {safe.contact_phone}
              </span>
            )}
          </div>
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

interface BodyProps {
  settings: ContactFormSettings;
  sectionId: string;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function ContactFormBody({ settings, sectionId }: BodyProps) {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ kind: "submitting" });

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      form_name: "contact",
      section_id: sectionId,
      name: (data.get("name") as string) || "",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      subject: (data.get("subject") as string) || "",
      message: (data.get("message") as string) || "",
      _hp: (data.get("_hp") as string) || "",
    };

    // Same-origin: post via the iframe's window.location.host. The public
    // tenant route lives on the same Next.js app, which proxies (in dev)
    // or hosts the Laravel API directly (in prod). For now we hit the
    // Laravel host explicitly via NEXT_PUBLIC_API_URL.
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const subdomain = resolveSubdomain();
    if (!subdomain) {
      setState({
        kind: "error",
        message:
          "Couldn't determine site subdomain — please refresh and try again.",
      });
      return;
    }

    try {
      const res = await fetch(
        `${apiBase}/api/public/sites/by-subdomain/${encodeURIComponent(subdomain)}/forms`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as Record<string, unknown>);
        const msg =
          (body as { message?: string }).message ?? "Couldn't send your message. Please try again.";
        setState({ kind: "error", message: msg });
        return;
      }

      setState({ kind: "success" });
      form.reset();
    } catch {
      setState({
        kind: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  };

  if (state.kind === "success") {
    return (
      <div
        className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
        role="status"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-3 text-lg font-semibold text-emerald-900">
          {settings.success_heading}
        </p>
        {settings.success_message && (
          <p className="mt-1.5 text-sm leading-relaxed text-emerald-800">
            {settings.success_message}
          </p>
        )}
        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-4 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = state.kind === "submitting";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 grid gap-4"
      noValidate={false}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" type="text" autoComplete="name" />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      {(settings.show_phone || settings.show_subject) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {settings.show_phone && (
            <Field
              label="Phone"
              name="phone"
              type="tel"
              required={settings.require_phone}
              autoComplete="tel"
            />
          )}
          {settings.show_subject && (
            <Field
              label="Subject"
              name="subject"
              type="text"
              autoComplete="off"
            />
          )}
        </div>
      )}

      <Field
        label="Message"
        name="message"
        type="textarea"
        required
        rows={5}
        autoComplete="off"
      />

      {/* Honeypot — kept off-screen via CSS so users never see it, but bots
          that auto-fill every input will populate it and trigger silent
          rejection on the server. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Don&apos;t fill this in
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {state.kind === "error" && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {state.message}
        </p>
      )}

      <div className="mt-2 flex justify-end">
        <EngineElement
          el="submit"
          kind="button"
          as="button"
          className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: tokenVar("color.primary"),
          }}
          {...({
            type: "submit",
            disabled: submitting,
          } as object)}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Sending…" : settings.submit_label}
        </EngineElement>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  type: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  rows?: number;
  autoComplete?: string;
}

function Field({ label, name, type, required, rows = 4, autoComplete }: FieldProps) {
  const id = `cf-${name}`;
  const base =
    "h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition-all focus:ring-4";
  const cls = `${base} border-[rgba(0,0,0,0.12)] focus:border-current focus:ring-current/15`;

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-[12px] font-semibold opacity-90">
        {label}
        {required && <span className="ms-1 text-red-500">*</span>}
      </span>
      {type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          required={required}
          rows={rows}
          autoComplete={autoComplete}
          className={`${cls} h-auto py-3`}
          style={{ resize: "vertical" }}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          className={cls}
        />
      )}
    </label>
  );
}

/** Pull the subdomain out of the current host. Handles `*.localhost`,
 *  `*.jamiyaweb.com`, and custom domains (returns the host as-is in that
 *  case — the public route checks both subdomain and custom_domain). */
function resolveSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.host;
  // Drop port
  const hostNoPort = host.split(":")[0];
  // Take the leading label as the subdomain
  const parts = hostNoPort.split(".");
  if (parts.length === 0) return null;
  // For localhost dev (e.g. "compassion.localhost") → "compassion"
  // For multi-tld (e.g. "foo.jamiyaweb.com") → "foo"
  return parts[0];
}
