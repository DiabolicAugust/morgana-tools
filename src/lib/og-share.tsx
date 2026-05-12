import { SITE_NAME } from "@/lib/site";
import { SITE_OG_CARD_SUBLINE } from "@/lib/site-seo";

/** JSX for `next/og` ImageResponse — inline styles only (no Tailwind). */
export function ShareOgGraphic() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#18181b",
        backgroundImage:
          "linear-gradient(135deg, #18181b 0%, #27272a 45%, #3f3f46 100%)",
        padding: 72,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#fafafa",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {SITE_NAME}
      </div>
      <div
        style={{
          marginTop: 28,
          fontSize: 26,
          color: "#a1a1aa",
          maxWidth: 920,
          lineHeight: 1.35,
        }}
      >
        {SITE_OG_CARD_SUBLINE}
      </div>
    </div>
  );
}

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
