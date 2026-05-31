"use client";

import { useState } from "react";
import { z } from "zod";
import { ChevronDown } from "lucide-react";
import type { SectionComponentProps } from "@/engine/component-registry";
import { tokenVar } from "@/engine/core/tokens";
import { EngineElement } from "@/engine/element/EngineElement";
import { nullSafeBoolean, nullSafeString } from "../_helpers";

/**
 * FAQ accordion — eyebrow + heading + list of Q&A items.
 *
 * `allow_multiple` controls whether more than one panel can be open at a
 * time. Uses native button + aria-expanded for keyboard accessibility.
 *
 * Each item: { question, answer }
 *
 * Element ids:
 *   • background  (kind: background)
 *   • container   (kind: container)
 *   • eyebrow     (kind: text)
 *   • heading     (kind: heading)
 *   • subheading  (kind: text)
 *   • list        (kind: container)
 */

const QuestionSchema = z.object({
  question: nullSafeString(""),
  answer: nullSafeString(""),
});

export const FaqSchema = z.object({
  eyebrow: nullSafeString(""),
  heading: nullSafeString("Frequently asked"),
  subheading: nullSafeString(""),
  allow_multiple: nullSafeBoolean(false),
  questions: z.array(QuestionSchema).default([]),
});

export type FaqSettings = z.infer<typeof FaqSchema>;

export default function Faq({
  settings,
}: SectionComponentProps<FaqSettings>) {
  const safe = FaqSchema.parse(settings);

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

        {safe.questions.length > 0 && (
          <EngineElement
            el="list"
            kind="container"
            as="div"
            className="mt-10 divide-y overflow-hidden rounded-2xl border bg-white shadow-sm"
            style={{
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <FaqList
              questions={safe.questions}
              allowMultiple={safe.allow_multiple}
            />
          </EngineElement>
        )}
      </EngineElement>
    </EngineElement>
  );
}

// ────────────────────────────────────────────────────────────────────────

function FaqList({
  questions,
  allowMultiple,
}: {
  questions: { question: string; answer: string }[];
  allowMultiple: boolean;
}) {
  // First item open by default, the rest closed.
  const [openSet, setOpenSet] = useState<Set<number>>(new Set([0]));

  const toggle = (idx: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        if (!allowMultiple) next.clear();
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <>
      {questions.map((q, i) => {
        const open = openSet.has(i);
        return (
          <FaqItem
            key={i}
            open={open}
            onToggle={() => toggle(i)}
            question={q.question}
            answer={q.answer}
          />
        );
      })}
    </>
  );
}

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="border-b last:border-b-0"
      style={{ borderColor: "rgba(0,0,0,0.06)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-foreground/[0.02]"
      >
        <span
          className="text-base font-semibold"
          style={{
            fontFamily: "var(--jw-font-heading, inherit)",
            color: "var(--jw-section-heading, inherit)",
          }}
        >
          {question || "—"}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            color: tokenVar("color.primary"),
          }}
          aria-hidden
        />
      </button>

      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <p
            className="px-5 pb-5 text-sm leading-relaxed opacity-85"
            style={{
              fontFamily: "var(--jw-font-body, inherit)",
              fontSize: "calc(0.95rem * var(--jw-section-body-scale, 1))",
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
