import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import LoginForm from "@/components/portal/LoginForm";
import AuthSplit from "@/components/auth/AuthSplit";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portal.login" });
  return { title: t("title") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthSplit>
      <LoginForm />
    </AuthSplit>
  );
}
