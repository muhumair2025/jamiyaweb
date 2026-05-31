/**
 * Tiny SVG mocks rendered inside the Variants tab cards. They're abstract
 * representations of the variant layout, not screenshots — they stay sharp,
 * read fast, and don't require any backend work to host.
 */

export function ClassicThumbnail() {
  return (
    <svg
      viewBox="0 0 160 96"
      role="img"
      aria-label="Classic hero preview"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="cls-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#20665c" />
          <stop offset="100%" stopColor="#0d322c" />
        </linearGradient>
        <radialGradient id="cls-glow" cx="0.78" cy="0.15" r="0.6">
          <stop offset="0%" stopColor="#c18f2c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c18f2c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="96" rx="6" fill="url(#cls-bg)" />
      <rect width="160" height="96" rx="6" fill="url(#cls-glow)" />
      {/* Eyebrow chip */}
      <rect x="60" y="22" width="40" height="6" rx="3" fill="#ffffff" fillOpacity="0.22" />
      {/* Title lines */}
      <rect x="36" y="36" width="88" height="6" rx="2" fill="#ffffff" fillOpacity="0.92" />
      <rect x="48" y="46" width="64" height="6" rx="2" fill="#ffffff" fillOpacity="0.92" />
      {/* Subtitle */}
      <rect x="52" y="58" width="56" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.55" />
      <rect x="58" y="64" width="44" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.55" />
      {/* CTA pill */}
      <rect x="64" y="74" width="32" height="10" rx="5" fill="#c18f2c" />
    </svg>
  );
}

export function MinimalThumbnail() {
  return (
    <svg
      viewBox="0 0 160 96"
      role="img"
      aria-label="Minimal hero preview"
      className="h-full w-full"
    >
      <rect width="160" height="96" rx="6" fill="#fafaf7" />
      {/* Top hairline accent */}
      <line
        x1="40"
        y1="6"
        x2="120"
        y2="6"
        stroke="#c18f2c"
        strokeOpacity="0.45"
        strokeWidth="0.5"
      />
      {/* Brand-coloured tick before eyebrow */}
      <rect x="56" y="26" width="10" height="2" rx="1" fill="#c18f2c" />
      {/* Eyebrow */}
      <rect x="70" y="25.5" width="28" height="3" rx="1" fill="#1a1a1a" fillOpacity="0.55" />
      {/* Title — two strong lines */}
      <rect x="34" y="38" width="92" height="6" rx="1.5" fill="#1a1a1a" fillOpacity="0.92" />
      <rect x="46" y="48" width="68" height="6" rx="1.5" fill="#1a1a1a" fillOpacity="0.92" />
      {/* Subtitle */}
      <rect x="48" y="62" width="64" height="2.5" rx="1" fill="#1a1a1a" fillOpacity="0.45" />
      <rect x="54" y="67" width="52" height="2.5" rx="1" fill="#1a1a1a" fillOpacity="0.45" />
      {/* Underline CTA */}
      <rect x="68" y="80" width="24" height="2" rx="1" fill="#c18f2c" />
      <line x1="68" y1="84" x2="92" y2="84" stroke="#c18f2c" strokeWidth="0.8" />
    </svg>
  );
}

export function SliderThumbnail() {
  return (
    <svg
      viewBox="0 0 160 96"
      role="img"
      aria-label="Slider hero preview"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="sld-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2d7c70" />
          <stop offset="60%" stopColor="#0d322c" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <radialGradient id="sld-glow" cx="0.25" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#c18f2c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c18f2c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="96" rx="6" fill="url(#sld-bg)" />
      <rect width="160" height="96" rx="6" fill="url(#sld-glow)" />
      {/* Eyebrow */}
      <line x1="14" y1="20" x2="22" y2="20" stroke="#c18f2c" strokeWidth="1" />
      <rect x="26" y="17.5" width="26" height="3" rx="1" fill="#ffffff" fillOpacity="0.75" />
      {/* Title — bottom-aligned, dramatic */}
      <rect x="14" y="40" width="100" height="8" rx="2" fill="#ffffff" fillOpacity="0.95" />
      <rect x="14" y="52" width="70" height="8" rx="2" fill="#ffffff" fillOpacity="0.95" />
      {/* Subtitle */}
      <rect x="14" y="66" width="56" height="2.5" rx="1" fill="#ffffff" fillOpacity="0.6" />
      {/* CTA pill */}
      <rect x="14" y="74" width="26" height="8" rx="4" fill="#c18f2c" />
      {/* Prev / next chevrons */}
      <path d="M6 48 L9 51 L6 54" stroke="#ffffff" strokeOpacity="0.55" fill="none" strokeWidth="0.8" />
      <path d="M154 48 L151 51 L154 54" stroke="#ffffff" strokeOpacity="0.55" fill="none" strokeWidth="0.8" />
      {/* Pagination dots — active is wider, accent-coloured */}
      <rect x="68" y="88" width="14" height="2.5" rx="1.25" fill="#c18f2c" />
      <circle cx="88" cy="89.25" r="1.25" fill="#ffffff" fillOpacity="0.6" />
      <circle cx="94" cy="89.25" r="1.25" fill="#ffffff" fillOpacity="0.6" />
      {/* Autoplay progress hairline */}
      <line x1="0" y1="95" x2="44" y2="95" stroke="#c18f2c" strokeWidth="1" />
    </svg>
  );
}

export function CinematicThumbnail() {
  return (
    <svg
      viewBox="0 0 160 96"
      role="img"
      aria-label="Cinematic hero preview"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="cin-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a8d80" />
          <stop offset="55%" stopColor="#143832" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <radialGradient id="cin-glow" cx="0.72" cy="0.25" r="0.7">
          <stop offset="0%" stopColor="#c18f2c" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c18f2c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cin-vignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="160" height="96" rx="6" fill="url(#cin-bg)" />
      <rect width="160" height="96" rx="6" fill="url(#cin-glow)" />
      <rect width="160" height="96" rx="6" fill="url(#cin-vignette)" />
      {/* Top motif line */}
      <line x1="12" y1="10" x2="148" y2="10" stroke="#c18f2c" strokeOpacity="0.45" strokeWidth="0.5" />
      {/* Top eyebrow */}
      <line x1="12" y1="18" x2="22" y2="18" stroke="#c18f2c" strokeWidth="1" />
      <rect x="26" y="15" width="28" height="4" rx="1" fill="#ffffff" fillOpacity="0.7" />
      {/* Big display title — centered, dominates the canvas */}
      <rect x="14" y="36" width="132" height="9" rx="2" fill="#ffffff" fillOpacity="0.95" />
      <rect x="28" y="49" width="104" height="9" rx="2" fill="#ffffff" fillOpacity="0.95" />
      {/* Bottom divider */}
      <line x1="14" y1="70" x2="146" y2="70" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.5" />
      {/* Bottom row: subtitle (left) + CTA (right) */}
      <rect x="14" y="76" width="58" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.55" />
      <rect x="14" y="82" width="40" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.55" />
      <rect x="118" y="76" width="28" height="9" rx="4.5" fill="#c18f2c" />
      {/* Scroll cue */}
      <circle cx="80" cy="90" r="1" fill="#ffffff" fillOpacity="0.6" />
    </svg>
  );
}
