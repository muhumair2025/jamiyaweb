import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, LifeBuoy, MapPin, Clock, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

export default async function ContactPage(
  props: PageProps<"/[locale]/contact">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const tForm = await getTranslations("contact.form");
  const tInfo = await getTranslations("contact.info");

  const infoCards = [
    { icon: Mail, label: tInfo("emailLabel"), value: tInfo("email") },
    { icon: LifeBuoy, label: tInfo("supportLabel"), value: tInfo("support") },
    { icon: MapPin, label: tInfo("locationLabel"), value: tInfo("location") },
    { icon: Clock, label: tInfo("hoursLabel"), value: tInfo("hours") },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-paper pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div
          aria-hidden
          className="absolute -top-20 start-1/2 -z-10 h-[360px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-100/70 to-transparent blur-3xl"
        />
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                {t("eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                {t("title")}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-soft">
                {t("subtitle")}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* CONTACT */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Form */}
            <Reveal direction="up" className="lg:col-span-7">
              <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-10">
                <form className="grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="name"
                      type="text"
                      label={tForm("name")}
                      placeholder={tForm("namePlaceholder")}
                      required
                    />
                    <Field
                      id="email"
                      type="email"
                      label={tForm("email")}
                      placeholder={tForm("emailPlaceholder")}
                      required
                    />
                  </div>

                  <Field
                    id="subject"
                    type="text"
                    label={tForm("subject")}
                    placeholder={tForm("subjectPlaceholder")}
                  />

                  <div className="grid gap-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      {tForm("message")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      placeholder={tForm("messagePlaceholder")}
                      className="rounded-xl border border-border bg-background p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  </div>

                  <div className="flex flex-col items-stretch justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center">
                    <p className="text-xs text-muted-foreground">
                      {tForm("consent")}
                    </p>
                    <button
                      type="submit"
                      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-card transition-all hover:bg-brand sm:self-end"
                    >
                      {tForm("submit")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </button>
                  </div>
                </form>
              </div>
            </Reveal>

            {/* Info */}
            <Reveal direction="up" delay={0.1} className="lg:col-span-5">
              <div className="space-y-3">
                {infoCards.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-foreground sm:text-base">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Decorative call-to-action card */}
                <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white">
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-arabesque opacity-40"
                  />
                  <div className="relative">
                    <p className="font-arabic-auto text-xl font-bold text-gold-200">
                      السلام عليكم
                    </p>
                    <p className="mt-2 text-sm text-white/75">
                      We respond to every message personally. No bots, no
                      tickets — just a real human reply, in shaa Allah.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

function Field({
  id,
  type,
  label,
  placeholder,
  required,
}: {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </div>
  );
}
