import { loadFont } from "@remotion/google-fonts/DMSans";

const { fontFamily } = loadFont("normal", {
  weights: ["600"],
  subsets: ["latin"],
});

/**
 * Brand guidelines for Remotion videos.
 * Import this in compositions to keep colors, typography, and spacing consistent.
 */
export const brand = {
  colors: {
    primary: "#0066CC",
    secondary: "#333333",
    background: "#000000",
    text: "#FFFFFF",
    textMuted: "#666666",
  },
  fonts: {
    /** Use for headings and titles. Loaded via @remotion/google-fonts/Inter. */
    heading: fontFamily,
    /** Use for body text. Same as heading for a cohesive look. */
    body: fontFamily,
  },
  fontSize: {
    title: 72,
    subtitle: 36,
    body: 24,
    small: 18,
  },
  fontWeight: {
    regular: "400" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  /** Horizontal padding as fraction of width (e.g. 0.1 = 10% each side). */
  paddingHorizontal: 0.1,
} as const;

export type Brand = typeof brand;
