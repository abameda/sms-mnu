import Link from "next/link";

/* ── SVG icon components ──────────────────────────────────────── */

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* Correct Codeforces "cf" logo – two overlapping bars */
function CodeforcesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5C6 20.328 5.328 21 4.5 21h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5C14.328 3 15 3.672 15 4.5V19.5c0 .828-.672 1.5-1.5 1.5h-3C9.672 21 9 20.328 9 19.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-9c0-.828.672-1.5 1.5-1.5h3z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/abameda",
    icon: GitHubIcon,
    /* GitHub: classic dark/charcoal → near-white on hover */
    hoverColor: "oklch(0.96 0.002 220)",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/elshorbagy/",
    icon: LinkedInIcon,
    /* LinkedIn blue */
    hoverColor: "oklch(0.55 0.18 245)",
  },
  {
    label: "Codeforces",
    href: "https://codeforces.com/profile/abameda",
    icon: CodeforcesIcon,
    /* Codeforces red */
    hoverColor: "oklch(0.58 0.22 25)",
  },
] as const;

export default function Footer() {
  const dimColor = "oklch(0.48 0.009 220)";

  return (
    <footer
      aria-label="Site footer"
      className="relative z-10 mt-auto"
      style={{ background: "oklch(0.165 0.007 220 / 0.85)" }}
    >
      <div className="flex flex-col items-center gap-2 px-6 py-4">
        {/* Copyright line */}
        <p
          className="text-xs font-medium tracking-wide text-center"
          style={{ color: dimColor }}
        >
          © 2026{" "}
          <a
            href="https://www.shorbagy.space/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-colors duration-150"
            style={{ color: "oklch(0.72 0.16 50)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                "oklch(0.82 0.18 50)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                "oklch(0.72 0.16 50)")
            }
          >
            Abdelhmeed Elshorbagy
          </a>{" "}
          · All rights reserved
        </p>

        {/* Social icons – centered, under the name */}
        <nav aria-label="Social links" className="flex items-center gap-1">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon, hoverColor }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
              style={{ color: dimColor, background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = hoverColor;
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.24 0.008 220 / 0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = dimColor;
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon className="w-4 h-4" />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
