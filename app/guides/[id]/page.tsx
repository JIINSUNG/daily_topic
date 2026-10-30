import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadGuides } from "@/lib/content/loadGuides";
import { GuideDetailView } from "@/components/guides/GuideDetailView";

export function generateStaticParams() {
  const { items } = loadGuides();
  return items.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const guide = loadGuides().items.find((g) => g.id === id);
  if (!guide) return {};
  return { title: guide.title, description: guide.intro };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = loadGuides().items.find((g) => g.id === id);
  if (!guide) notFound();
  return <GuideDetailView guide={guide} />;
}
