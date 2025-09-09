import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://about.smartquery.dev" },
    { url: "https://about.smartquery.dev/imprint" },
    { url: "https://about.smartquery.dev/privacy-policy" },
    { url: "https://about.smartquery.dev/terms-of-use" },
    { url: "https://smartquery.dev" },
    { url: "https://smartquery.dev/add-connection" },
    { url: "https://smartquery.dev/conn/demo/demo" },
    { url: "https://smartquery.dev/connect-to-mysql" },
    { url: "https://smartquery.dev/connect-to-postgres" },
    { url: "https://smartquery.dev/open-sqlite" },
  ];
}
