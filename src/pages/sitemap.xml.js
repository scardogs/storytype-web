import { SITE_URL } from "../lib/seo";

function generateSiteMap() {
  const lastModified = new Date().toISOString();
  const routes = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/type", priority: "0.9", changefreq: "daily" },
    { path: "/training", priority: "0.9", changefreq: "daily" },
    { path: "/tournaments", priority: "0.9", changefreq: "daily" },
    { path: "/leaderboard", priority: "0.8", changefreq: "daily" },
    { path: "/analytics", priority: "0.8", changefreq: "weekly" },
    { path: "/info", priority: "0.7", changefreq: "monthly" },
  ];

  const urls = routes
    .map(
      (route) => `
    <url>
      <loc>${SITE_URL}${route.path}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>${route.changefreq}</changefreq>
      <priority>${route.priority}</priority>
    </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/xml");
  res.write(generateSiteMap());
  res.end();

  return {
    props: {},
  };
}

export default function SiteMap() {
  return null;
}
