// Inline SVG flags (emoji flags don't render on Windows). Rounded via the
// wrapper span's overflow:hidden, so no clipPath id collisions.
function Wrap({ children }: { children: React.ReactNode }) {
  return <span className="flag">{children}</span>;
}

export function FlagUz() {
  return (
    <Wrap>
      <svg viewBox="0 0 24 16" width="100%" height="100%" preserveAspectRatio="none">
        <rect width="24" height="16" fill="#fff" />
        <rect width="24" height="5" fill="#1eb4e7" />
        <rect y="11" width="24" height="5" fill="#1eb53a" />
        <rect y="4.6" width="24" height="0.5" fill="#ce1126" />
        <rect y="10.9" width="24" height="0.5" fill="#ce1126" />
        <circle cx="4.4" cy="2.6" r="1.55" fill="#fff" />
        <circle cx="5.1" cy="2.6" r="1.35" fill="#1eb4e7" />
        <circle cx="6.7" cy="1.5" r="0.28" fill="#fff" />
        <circle cx="6.7" cy="2.7" r="0.28" fill="#fff" />
        <circle cx="7.9" cy="1.5" r="0.28" fill="#fff" />
        <circle cx="7.9" cy="2.7" r="0.28" fill="#fff" />
      </svg>
    </Wrap>
  );
}

export function FlagRu() {
  return (
    <Wrap>
      <svg viewBox="0 0 24 16" width="100%" height="100%" preserveAspectRatio="none">
        <rect width="24" height="16" fill="#fff" />
        <rect y="5.33" width="24" height="5.34" fill="#0039a6" />
        <rect y="10.66" width="24" height="5.34" fill="#d52b1e" />
      </svg>
    </Wrap>
  );
}

export function FlagEn() {
  return (
    <Wrap>
      <svg viewBox="0 0 24 16" width="100%" height="100%" preserveAspectRatio="none">
        <rect width="24" height="16" fill="#012169" />
        <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3.2" />
        <path d="M0 0 24 16M24 0 0 16" stroke="#c8102e" strokeWidth="1.4" />
        <rect x="9.5" width="5" height="16" fill="#fff" />
        <rect y="5.5" width="24" height="5" fill="#fff" />
        <rect x="10.5" width="3" height="16" fill="#c8102e" />
        <rect y="6.5" width="24" height="3" fill="#c8102e" />
      </svg>
    </Wrap>
  );
}

export const FLAG: Record<string, () => React.ReactElement> = {
  uz: FlagUz,
  ru: FlagRu,
  en: FlagEn,
};
