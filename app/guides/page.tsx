import type { Metadata } from "next";
import { loadGuides } from "@/lib/content/loadGuides";
import { GuidesListView } from "@/components/guides/GuidesListView";

export const metadata: Metadata = {
  title: "면접 가이드",
  description: "인성면접·기술면접에서 실제로 통하는 전략과 팁을 확인하세요.",
};

export default function GuidesPage() {
  const { items } = loadGuides();
  return <GuidesListView guides={items} />;
}
