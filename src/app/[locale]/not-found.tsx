import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("catalog");
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="font-display text-5xl">SHOVKANA</h1>
      <Link href="/catalog" className="btn mt-8">
        {t("title")}
      </Link>
    </div>
  );
}
