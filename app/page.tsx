import { loadContent } from "@/lib/content/load";
import { HomeView } from "@/components/home/HomeView";

export default function Home() {
  const { topics, index } = loadContent();
  return <HomeView topics={topics} tracks={index.tracks} />;
}
