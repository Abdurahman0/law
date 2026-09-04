import { setRequestLocale } from "next-intl/server";
import SecureChat from "@/components/chat/SecureChat";

type Props = { params: Promise<{ locale: string; roomId: string }> };

export default async function Page({ params }: Props) {
  const { locale, roomId } = await params;
  setRequestLocale(locale);
  return <SecureChat roomId={roomId} />;
}
