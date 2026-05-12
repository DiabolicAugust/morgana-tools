import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE, ShareOgGraphic } from "@/lib/og-share";
import { SITE_SHARE_IMAGE_ALT } from "@/lib/site-seo";

export const alt = SITE_SHARE_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<ShareOgGraphic />, { ...OG_IMAGE_SIZE });
}
