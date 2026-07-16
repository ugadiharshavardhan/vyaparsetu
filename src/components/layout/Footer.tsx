import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageCircle, Briefcase, Camera, Hash, MonitorPlay } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { FOOTER_LINKS, SITE } from "@/constants/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" />{SITE.address}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" />{SITE.phone}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" />{SITE.email}</li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              {[MessageCircle, Briefcase, Camera, Hash, MonitorPlay].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-brand hover:text-white hover:border-brand"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-foreground">{group}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved. Built for Bharat's businesses.
          </p>
          <p className="text-xs text-muted-foreground">
            GSTIN: 29ABCDE1234F1Z5 · CIN: U74999KA2026PTC000000
          </p>
        </div>
      </div>
    </footer>
  );
}
