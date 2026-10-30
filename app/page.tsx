import { loadContent } from "@/lib/content/load";
import { loadEssays } from "@/lib/content/loadEssays";
import { HomeView } from "@/components/home/HomeView";

export default function Home() {
  const { topics, index } = loadContent();
  const { items: essays } = loadEssays();
  const essaySummaries = essays.map((e) => ({ id: e.id, category: e.category, question: e.question }));
  return <HomeView topics={topics} tracks={index.tracks} essays={essaySummaries} />;
}
