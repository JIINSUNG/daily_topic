import { loadContent } from "@/lib/content/load";
import { HomeView } from "@/components/home/HomeView";

export default function Home() {
  const { topics } = loadContent();
  return <HomeView topics={topics} />;
}
