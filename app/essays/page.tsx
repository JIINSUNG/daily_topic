import type { Metadata } from "next";
import { loadEssays } from "@/lib/content/loadEssays";
import { EssaysListView } from "@/components/essays/EssaysListView";

export const metadata: Metadata = {
  title: "자소서 문항",
  description: "지원동기, 성장과정, 장단점 같은 자기소개서 단골 문항을 매일 조금씩 써보세요.",
};

export default function EssaysPage() {
  const { items } = loadEssays();
  return <EssaysListView essays={items} />;
}
