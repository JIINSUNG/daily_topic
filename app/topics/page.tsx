import { loadContent } from "@/lib/content/load";
import { TopicsListView } from "@/components/topics/TopicsListView";

export default function TopicsPage() {
  const { topics, index } = loadContent();
  return <TopicsListView topics={topics} tracks={index.tracks} />;
}
