import {
  Bricolage_Grotesque,
  Gelasio,
  Inter,
  Poppins,
} from "next/font/google";

export const storePoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const storeInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const storeGelasio = Gelasio({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-gelasio",
  display: "swap",
});

export const storeAdminFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

/** CSS variables for all store-selectable fonts (root layout). */
export const storeFontVariables = [
  storePoppins.variable,
  storeInter.variable,
  storeGelasio.variable,
  storeAdminFont.variable,
].join(" ");
