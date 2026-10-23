import type { Metadata } from "next";
import { loadContent } from "@/lib/content/load";
import { TopicsListView } from "@/components/topics/TopicsListView";

export const metadata: Metadata = {
  title: "전체 토픽",
  description: "분야(프론트엔드·CS·알고리즘)와 레벨별로 모든 토픽을 한눈에 보고 골라 학습하세요.",
};

export default function TopicsPage() {
  const { topics, index } = loadContent();
  return <TopicsListView topics={topics} tracks={index.tracks} />;
}
