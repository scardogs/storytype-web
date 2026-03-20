import { SITE_URL } from "../lib/seo";

function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api
Disallow: /profile
Disallow: /settings

Sitemap: ${SITE_URL}/sitemap.xml
Host: storytype.space
`;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/plain");
  res.write(generateRobotsTxt());
  res.end();

  return {
    props: {},
  };
}

export default function RobotsTxt() {
  return null;
}
