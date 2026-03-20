import Head from "next/head";
import { useRouter } from "next/router";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  getDefaultStructuredData,
  getHomeStructuredData,
  getSeoForPath,
} from "../lib/seo";

export default function SEO() {
  const router = useRouter();
  const seo = getSeoForPath(router.pathname, router.asPath);
  const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`;
  const keywords = seo.keywords?.join(", ");
  const structuredData = [...getDefaultStructuredData()];

  if (seo.canonicalPath === "/") {
    structuredData.push(getHomeStructuredData());
  }

  if (seo.canonicalPath === "/training") {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "Course",
      name: "StoryType Typing Training",
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      description:
        "Structured typing lessons, drills, and assessments that help users improve typing speed and accuracy.",
    });
  }

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="robots"
        content={seo.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}
      />
      <meta name="googlebot" content={seo.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="theme-color" content="#111827" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="author" content={SITE_NAME} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? (
        <meta
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
        />
      ) : null}

      <link rel="canonical" href={canonicalUrl} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />
      <link rel="manifest" href="/site.webmanifest" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:alt" content="StoryType website preview" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

      {structuredData.map((entry, index) => (
        <script
          key={`${entry["@type"]}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry),
          }}
        />
      ))}
    </Head>
  );
}
