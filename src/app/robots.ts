import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 관리자 화면과 내부 API는 검색에 노출될 이유가 없다.
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
