import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadEssays } from "@/lib/content/loadEssays";
import { EssayDetailView } from "@/components/essays/EssayDetailView";

export function generateStaticParams() {
  const { items } = loadEssays();
  return items.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const essay = loadEssays().items.find((e) => e.id === id);
  if (!essay) return {};
  return { title: essay.question, description: essay.why };
}

export default async function EssayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const essay = loadEssays().items.find((e) => e.id === id);
  if (!essay) notFound();
  return <EssayDetailView essay={essay} />;
}
