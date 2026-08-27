import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import RegisterFlow from "@/components/register/RegisterFlow";
import AuthSplit from "@/components/auth/AuthSplit";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "register" });
  return { title: t("metaTitle") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthSplit>
      <RegisterFlow />
    </AuthSplit>
  );
}
