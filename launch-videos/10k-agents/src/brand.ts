import { loadFont } from "@remotion/google-fonts/DMSans";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

/**
 * Brand guidelines for Remotion videos.
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
    heading: fontFamily,
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
  paddingHorizontal: 0.1,
} as const;

export type Brand = typeof brand;
