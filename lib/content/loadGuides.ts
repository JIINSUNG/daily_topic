import path from "node:path";
import { loadJsonDir, type LoadedJsonDir } from "./loadGeneric";
import { GuideIndexSchema, GuideSchema, type Guide, type GuideIndex } from "./guideSchema";

export function loadGuides(contentDir: string = path.join(process.cwd(), "content")): LoadedJsonDir<Guide, GuideIndex> {
  return loadJsonDir({
    dir: path.join(contentDir, "guides"),
    indexPath: path.join(contentDir, "guides", "index.json"),
    itemSchema: GuideSchema,
    indexSchema: GuideIndexSchema,
  });
}

export function getGuideById(id: string, contentDir?: string): Guide | undefined {
  return loadGuides(contentDir).items.find((g) => g.id === id);
}
