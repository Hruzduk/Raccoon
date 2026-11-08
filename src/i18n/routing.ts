import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uk", "en", "fr"],
  defaultLocale: "uk",
  localePrefix: "always",
});
