import { GraduationCap } from "lucide-react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/jonaedjoshim",
    label: "GitHub",
    icon: FaGithub,
  },
  {
    href: "https://www.linkedin.com/in/jonaed-joshim/",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
  {
    href: "https://wa.me/8801316323104",
    label: "WhatsApp",
    icon: FaWhatsapp,
  },
];

export default function Footer() {
  return (
    <footer
      className="shrink-0 border-t"
      style={{
        background: "var(--gp-surface)",
        borderColor: "var(--gp-border)",
      }}
    >
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            aria-label="GradePilot Dashboard"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: "var(--gp-primary-bg)",
              color: "var(--gp-primary)",
            }}
          >
            <GraduationCap size={19} />
          </Link>

          <div className="min-w-0">
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--gp-text)" }}
            >
              GradePilot
            </p>

            <p
              className="mt-0.5 text-[11px]"
              style={{ color: "var(--gp-text-muted)" }}
            >
              Academic analytics, made simple.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            to="/about"
            className="text-xs transition-colors hover:text-indigo-500"
            style={{ color: "var(--gp-text-muted)" }}
          >
            About
          </Link>

          <Link
            to="/calculator"
            className="text-xs transition-colors hover:text-indigo-500"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Calculator
          </Link>

          <span
            className="text-[11px]"
            style={{ color: "var(--gp-text-muted)" }}
          >
            © {new Date().getFullYear()} GradePilot
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="mr-1 text-[11px]"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Built by Md Jonaed Joshim
          </span>

          {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="flex size-8 items-center justify-center rounded-lg border transition-colors hover:bg-(--gp-surface-2)"
              style={{
                borderColor: "var(--gp-border)",
                color: "var(--gp-text-muted)",
              }}
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
