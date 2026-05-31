import type { SVGProps } from "react";

/**
 * Brand-mark SVGs that lucide-react no longer ships (over IP/trademark
 * concerns). Centralised here so every section that needs a social icon
 * can pull from the same source.
 *
 * Each icon uses `currentColor` so it inherits text colour — size via
 * `className` (h-4 w-4 etc.) on the surrounding container or via props.
 */

export type BrandIconProps = { className?: string } & SVGProps<SVGSVGElement>;

const COMMON = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true as const,
};

export function FacebookIcon(props: BrandIconProps) {
  return (
    <svg {...COMMON} {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon(props: BrandIconProps) {
  return (
    <svg
      {...COMMON}
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TwitterIcon(props: BrandIconProps) {
  // "X" logo (post-rebrand)
  return (
    <svg {...COMMON} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function YoutubeIcon(props: BrandIconProps) {
  return (
    <svg {...COMMON} {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.11-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.39.57A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.39-.57A3 3 0 0 0 23.5 17.8 31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: BrandIconProps) {
  return (
    <svg {...COMMON} {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function WhatsappIcon(props: BrandIconProps) {
  return (
    <svg {...COMMON} {...props}>
      <path d="M20.5 3.5A12 12 0 0 0 3.5 20.5L2 22l1.6-1.5A12 12 0 1 0 20.5 3.5Zm-8.5 18.05a10 10 0 0 1-5.1-1.4l-.36-.22-3.78.99 1-3.7-.24-.38a10 10 0 1 1 8.48 4.71Zm5.5-7.5c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07a8 8 0 0 1-2.36-1.46 8.8 8.8 0 0 1-1.63-2.03c-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.65-1.58-.9-2.17-.24-.57-.48-.5-.65-.51l-.55-.01c-.18 0-.48.07-.73.35-.25.28-.95.93-.95 2.27 0 1.34.98 2.63 1.11 2.82.13.18 1.91 2.91 4.63 4.08.65.28 1.15.45 1.55.58.65.2 1.24.17 1.71.1.52-.07 1.58-.64 1.8-1.27.23-.62.23-1.16.16-1.27-.06-.1-.25-.16-.55-.3Z" />
    </svg>
  );
}
