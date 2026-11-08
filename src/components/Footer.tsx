import { getTranslations } from "next-intl/server";
import { shop } from "@/data/shop";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl">Shovkana</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{t("pay")}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label={nav("menu")}>
          <Link href="/catalog">{nav("catalog")}</Link>
          <Link href="/about">{nav("about")}</Link>
          <Link href="/care">{nav("care")}</Link>
          <Link href="/delivery">{nav("delivery")}</Link>
          <Link href="/offer">{t("terms")}</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm">
          <a href={shop.instagram} target="_blank" rel="noreferrer">
            {t("instagram")}
          </a>
          <a href={shop.artistInstagram} target="_blank" rel="noreferrer">
            {t("artist")}
          </a>
          {shop.email ? <a href={`mailto:${shop.email}`}>{shop.email}</a> : null}
          {shop.phone ? <a href={`tel:${shop.phone}`}>{shop.phone}</a> : null}
        </div>
      </div>
    </footer>
  );
}
