"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "./CartProvider";

const links = [
  { href: "/catalog", key: "catalog" },
  { href: "/about", key: "about" },
  { href: "/care", key: "care" },
  { href: "/delivery", key: "delivery" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-display text-3xl leading-none tracking-wide">
          Shovkana
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label={t("menu")}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-plum">
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-[11px] tracking-[0.16em]">
            {(["uk", "en", "fr"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => router.replace(pathname, { locale: code })}
                className={code === locale ? "text-ink" : "text-muted"}
                aria-current={code === locale ? "true" : undefined}
                lang={code}
              >
                {code === "uk" ? "UA" : code.toUpperCase()}
              </button>
            ))}
          </div>
          <Link href="/cart" className="text-sm tracking-wide">
            {`${t("cart")} (${count})`}
          </Link>
          <button
            type="button"
            className="text-sm md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {t("menu")}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="flex flex-col gap-3 border-t border-line px-5 py-4 text-sm md:hidden">
          {links.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {t(item.key)}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
