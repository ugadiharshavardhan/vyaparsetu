import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SITE } from "@/constants/site";

const KNOW_MORE = [
  { label: "Blog", to: "/about" },
  { label: "Corporate Announcements", to: "/about" },
  { label: "Governance", to: "/about" },
  { label: "Privacy", to: "/about" },
  { label: "Terms of use", to: "/about" },
  { label: "Supplier Code of Conduct", to: "/about" },
  { label: "Help & Support", to: "/contact" },
] as const;

const SOCIALS = [
  { Icon: Linkedin, href: SITE.social.linkedin, label: "LinkedIn" },
  { Icon: Instagram, href: SITE.social.instagram, label: "Instagram" },
  { Icon: Youtube, href: SITE.social.youtube, label: "YouTube" },
];

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <path
        fill="#00D2FF"
        d="M22.7 8.6C17.4 14.2 14.3 22.8 14.3 34v444c0 11.2 3.1 19.8 8.7 25.2l1.5 1.4 248.8-248.8v-5.6L22.7 8.6z"
      />
      <path
        fill="#FFD500"
        d="M356.5 339.7l-83-83v-5.9l83-83.1 1.9 1.1 98.3 55.9c28.1 15.9 28.1 42.1 0 58.1l-98.3 55.8-1.9 1z"
      />
      <path
        fill="#FF3333"
        d="M358.4 338.6L273.4 253.6 22.7 504.4c9.3 9.8 24.5 11 41.7 1.3l294-167.1z"
      />
      <path
        fill="#48FF48"
        d="M358.4 168.6L64.4 1.6C47.2-8.2 32-7 22.7 2.8l250.7 250.8 85-85z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function StoreBadge({ variant }: { variant: "google" | "apple" }) {
  const isApple = variant === "apple";
  return (
    <a
      href="#"
      aria-label={isApple ? "Download on the App Store" : "Get it on Google Play"}
      className="inline-flex items-center gap-2.5 rounded-lg bg-black px-3.5 py-2 text-white ring-1 ring-white/15 transition-opacity hover:opacity-90"
    >
      {isApple ? (
        <AppleIcon className="h-6 w-6" />
      ) : (
        <GooglePlayIcon className="h-6 w-6" />
      )}
      <span className="leading-tight">
        <span className="block text-[9px] font-medium uppercase tracking-wide text-white/70">
          {isApple ? "Download on the" : "Get it on"}
        </span>
        <span className="block text-sm font-semibold">
          {isApple ? "App Store" : "Google Play"}
        </span>
      </span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand text-white">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr] lg:gap-8">
          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <p className="mt-4 text-sm font-semibold text-white">
              VyaparSetu Technologies Private Limited
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/80">
              4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka – 560001
            </p>
            <p className="mt-2 text-sm text-white/80">CIN: U74999KA2026PTC000000</p>
            <p className="mt-4 text-sm text-white">{SITE.phone}</p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-1 block text-sm text-white transition-colors hover:underline"
            >
              {SITE.email}
            </a>
          </div>

          {/* Know More */}
          <div>
            <h4 className="text-sm font-semibold text-white">Know More</h4>
            <ul className="mt-4 space-y-3">
              {KNOW_MORE.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow us on */}
          <div>
            <h4 className="text-sm font-semibold text-white">Follow us on</h4>
            <div className="mt-4 flex items-center gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand transition-transform hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Logo + app badges */}
          <div className="flex flex-col items-start gap-6 lg:items-end">
            <Logo variant="onBrand" />
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <StoreBadge variant="google" />
              <StoreBadge variant="apple" />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/20 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/80">FSSAI License No. 10020064002537</p>
          <p className="text-xs text-white/80">
            Copyright © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
