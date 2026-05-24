interface Props {
  items: string[];
}

export function LogoMarquee({ items }: Props) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden" dir="ltr">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
      />
      <div className="flex w-max animate-marquee gap-12 py-2">
        {doubled.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap text-base font-semibold tracking-tight text-foreground/40 sm:text-lg"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
