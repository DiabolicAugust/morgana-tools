import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE, ShareOgGraphic } from "@/lib/og-share";

export const alt = "Morgana Tools — free browser converters and developer helpers";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<ShareOgGraphic />, { ...OG_IMAGE_SIZE });
}
