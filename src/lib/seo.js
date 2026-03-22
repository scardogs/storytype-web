export const SITE_URL = "https://storytype.space";
export const SITE_NAME = "StoryType";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;
export const SITE_LOGO = `${SITE_URL}/favicon.ico?v=20260323`;

const DEFAULT_TITLE = "StoryType | Story-Based Typing Practice, Training, and Tournaments";
const DEFAULT_DESCRIPTION =
  "StoryType is a story-based typing website with real typing tests, structured training lessons, leaderboards, analytics, and competitive tournaments.";

const ROUTE_SEO = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "Practice typing with story-based text instead of random words. Improve speed and accuracy with typing tests, lessons, analytics, and tournaments on StoryType.",
    keywords: [
      "storytype",
      "typing test",
      "story typing test",
      "typing practice",
      "typing training",
      "typing tournament",
      "typing speed test",
    ],
  },
  "/type": {
    title: "Story-Based Typing Test | StoryType",
    description:
      "Take a typing test with story-driven prompts. Train typing speed, accuracy, and rhythm with text that feels worth reading.",
    keywords: [
      "typing test",
      "story typing",
      "typing practice online",
      "typing speed test",
      "typing accuracy test",
    ],
  },
  "/leaderboard": {
    title: "Typing Leaderboard | StoryType",
    description:
      "See top StoryType players ranked by speed, accuracy, and performance across story-based typing sessions.",
    keywords: [
      "typing leaderboard",
      "typing rankings",
      "fastest typists",
      "typing competition",
    ],
  },
  "/training": {
    title: "Typing Training Lessons | StoryType",
    description:
      "Follow structured typing lessons, drills, assessments, and progress tracking to improve speed and precision step by step.",
    keywords: [
      "typing lessons",
      "typing training",
      "typing drills",
      "learn typing online",
      "typing curriculum",
    ],
  },
  "/analytics": {
    title: "Typing Analytics Dashboard | StoryType",
    description:
      "Track typing speed, accuracy, weak spots, and progress trends with a detailed typing analytics dashboard.",
    keywords: [
      "typing analytics",
      "typing stats",
      "typing progress",
      "wpm tracker",
      "accuracy tracker",
    ],
  },
  "/daily-challenge": {
    title: "Daily Typing Challenge | StoryType",
    description:
      "Play the daily StoryType challenge, keep your streak alive, and compete on the day leaderboard.",
    keywords: [
      "daily typing challenge",
      "typing streak",
      "daily typing test",
      "storytype daily challenge",
    ],
  },
  "/tournaments": {
    title: "Typing Tournaments | StoryType",
    description:
      "Join competitive typing tournaments, create events, and compete against other typists in real-time challenges.",
    keywords: [
      "typing tournaments",
      "typing competition",
      "typing contest",
      "online typing tournament",
    ],
  },
  "/info": {
    title: "About StoryType | StoryType",
    description:
      "Learn what makes StoryType different from standard typing tests and how the platform combines stories, training, analytics, and competition.",
    keywords: [
      "about storytype",
      "storytype app",
      "typing platform",
    ],
  },
  "/profile": {
    title: "Profile | StoryType",
    description: DEFAULT_DESCRIPTION,
    noindex: true,
  },
  "/settings": {
    title: "Settings | StoryType",
    description: DEFAULT_DESCRIPTION,
    noindex: true,
  },
  "/coming-soon": {
    title: "Coming Soon | StoryType",
    description: DEFAULT_DESCRIPTION,
    noindex: true,
  },
  "/email-verified": {
    title: "Email Verified | StoryType",
    description: DEFAULT_DESCRIPTION,
    noindex: true,
  },
};

const DYNAMIC_ROUTE_SEO = [
  {
    match: (pathname) => pathname.startsWith("/training/modules/"),
    seo: {
      title: "Training Module | StoryType",
      description:
        "Work through a StoryType training module with guided lessons, drills, and assessments designed to improve typing performance.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/tournaments/"),
    seo: {
      title: "Tournament Details | StoryType",
      description:
        "View tournament schedules, players, rules, and competitive typing results on StoryType.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin"),
    seo: {
      title: "Admin | StoryType",
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    },
  },
];

export function getCanonicalPath(asPath = "/") {
  const [pathOnly] = asPath.split("#");
  const [pathname] = pathOnly.split("?");
  return pathname || "/";
}

export function getSeoForPath(pathname = "/", asPath = "/") {
  const canonicalPath = getCanonicalPath(asPath);

  if (ROUTE_SEO[pathname]) {
    return { ...ROUTE_SEO[pathname], canonicalPath };
  }

  const dynamicMatch = DYNAMIC_ROUTE_SEO.find((entry) =>
    entry.match(canonicalPath)
  );

  if (dynamicMatch) {
    return { ...dynamicMatch.seo, canonicalPath };
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonicalPath,
  };
}

export function getDefaultStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: SITE_LOGO,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: "Story Type",
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en",
    },
  ];
}

export function getHomeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser",
    description:
      "A story-based typing website with typing tests, structured training, analytics, leaderboards, and tournaments.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
