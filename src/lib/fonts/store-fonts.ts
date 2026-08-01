import {
  Bricolage_Grotesque,
  Fraunces,
  Gelasio,
  Hanken_Grotesk,
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

export const storeHankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

export const storeFraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
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
  storeHankenGrotesk.variable,
  storeFraunces.variable,
  storeAdminFont.variable,
].join(" ");
