import path from "node:path";
import { loadJsonDir, type LoadedJsonDir } from "./loadGeneric";
import { EssayIndexSchema, EssayPromptSchema, type EssayIndex, type EssayPrompt } from "./essaySchema";

export function loadEssays(contentDir: string = path.join(process.cwd(), "content")): LoadedJsonDir<EssayPrompt, EssayIndex> {
  return loadJsonDir({
    dir: path.join(contentDir, "essays"),
    indexPath: path.join(contentDir, "essays", "index.json"),
    itemSchema: EssayPromptSchema,
    indexSchema: EssayIndexSchema,
  });
}

export function getEssayById(id: string, contentDir?: string): EssayPrompt | undefined {
  return loadEssays(contentDir).items.find((e) => e.id === id);
}
