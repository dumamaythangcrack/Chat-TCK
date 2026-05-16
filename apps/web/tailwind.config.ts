import type { Config } from "tailwindcss";
import sharedConfig from "@tck/design-system/tailwind.config";

const config: Pick<Config, "presets" | "content"> = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;
