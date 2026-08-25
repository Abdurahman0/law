import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base: P = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconLogo = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path
      d="M7 5v14h11"
      stroke="#fff"
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 21a8 8 0 10-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

export const IconFileText = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 3v5h5M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);

export const IconSparkle = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
    <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);

export const IconVideo = (p: P) => (
  <svg {...base} {...p}>
    <path d="M15 10l5-3v10l-5-3v-4z" />
    <rect x="2" y="6" width="13" height="12" rx="3" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l8 4v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V7l8-4z" />
  </svg>
);

export const IconShieldCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l8 4v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V7l8-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconBuilding = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="8" width="18" height="12" rx="3" />
    <path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2" />
  </svg>
);

export const IconGift = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="10" width="18" height="11" rx="2" />
    <path d="M12 10V7a4 4 0 00-4-3c-2 0-3 1.4-3 3s2 3 4 3h6c2 0 4-1.4 4-3s-1-3-3-3a4 4 0 00-4 3z" />
  </svg>
);

export const IconDocLines = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h9" />
    <circle cx="18" cy="18" r="3" />
  </svg>
);

export const IconInfo = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const IconSend = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M4 12l16-8-6 16-2-6-8-2z" />
  </svg>
);

export const IconChevronLeft = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconChevronRight = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconChat = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 12a8 8 0 01-8 8H4l2.3-2.3A8 8 0 1121 12z" />
  </svg>
);

export const IconChatDots = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 12a8 8 0 01-8 8H4l2.3-2.3A8 8 0 1121 12z" />
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconAlert = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9L2.4 17a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
  </svg>
);

export const IconRefresh = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 12a9 9 0 11-3-6.7" />
    <path d="M21 4v5h-5" />
  </svg>
);

export const IconClipboardCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

export const IconScale = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 4v16M6 8h12M8 8l-3 6h6L8 8zm8 0l-3 6h6l-3-6z" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const IconGraduation = (p: P) => (
  <svg {...base} {...p}>
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
  </svg>
);

export const IconHome = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 11l9-7 9 7v8a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-8z" />
  </svg>
);

export const IconGrid = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

export const IconCard = (p: P) => (
  <svg {...base} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 10h20M6 15h4" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
  </svg>
);

export const IconApple = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.6} {...p}>
    <path d="M12 6c.6-2 2.2-3.4 4-3.5.2 1.9-.6 3.5-1.8 4.4M17 12c0-2.3 1.8-3.4 1.9-3.5-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.6-.9 1-1.8 1.2-2.4-2.6-1-2.6-4.6-2.6-4.7z" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconGooglePlay = (p: P) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth={1.6}
    strokeLinejoin="round"
    {...p}
  >
    <path d="M4 3l11 9L4 21V3z" />
    <path d="M15 12l4-2.3M15 12l4 2.3" />
  </svg>
);
