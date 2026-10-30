// content/topics 전용이던 lib/content/load.ts의 검증 패턴(파일별 zod 검증, 에러 모아서 한 번에
// 던지기, index.order와 실제 파일 목록 양방향 대조)을 다른 콘텐츠 종류에도 쓰기 위해 일반화한 버전.
// topics 쪽은 이미 테스트가 많아 손대지 않고 그대로 두고, 새 콘텐츠(자소서 문항·면접 가이드)는
// 이 함수를 쓴다.
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export class ContentValidationError extends Error {}

function formatZodIssues(filePath: string, error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const fieldPath = issue.path.length ? issue.path.join(".") : "(root)";
    return `${filePath}: 필드 '${fieldPath}' - ${issue.message}`;
  });
}

type ReadResult = { ok: true; data: unknown } | { ok: false; error: string };

function readJsonFile(filePath: string): ReadResult {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return { ok: false, error: `${filePath}: 파일을 읽을 수 없습니다 - ${(e as Error).message}` };
  }
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: `${filePath}: JSON 파싱 실패 - ${(e as Error).message}` };
  }
}

export interface LoadJsonDirOptions<TItem extends { id: string }, TIndex extends { order: string[] }> {
  dir: string;
  indexPath: string;
  itemSchema: z.ZodType<TItem>;
  indexSchema: z.ZodType<TIndex>;
}

export interface LoadedJsonDir<TItem, TIndex> {
  index: TIndex;
  items: TItem[];
}

/**
 * dir 안의 모든 *.json을 itemSchema로, indexPath를 indexSchema로 검증한다.
 * 파일명과 id 일치, id 중복, index.order와 파일 목록 양방향 일치까지 확인하고
 * 문제가 있으면 전부 모아 ContentValidationError로 던진다.
 */
export function loadJsonDir<TItem extends { id: string }, TIndex extends { order: string[] }>(
  options: LoadJsonDirOptions<TItem, TIndex>,
): LoadedJsonDir<TItem, TIndex> {
  const { dir, indexPath, itemSchema, indexSchema } = options;
  const errors: string[] = [];

  let index: TIndex | null = null;
  const indexResult = readJsonFile(indexPath);
  if (!indexResult.ok) {
    errors.push(indexResult.error);
  } else {
    const parsed = indexSchema.safeParse(indexResult.data);
    if (!parsed.success) errors.push(...formatZodIssues(indexPath, parsed.error));
    else index = parsed.data;
  }

  const indexFileName = path.basename(indexPath);
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json") && f !== indexFileName)
      .sort();
  } catch (e) {
    errors.push(`${dir}: 디렉터리를 읽을 수 없습니다 - ${(e as Error).message}`);
  }

  const itemsById = new Map<string, TItem>();
  for (const file of files) {
    const filePath = path.join(dir, file);
    const result = readJsonFile(filePath);
    if (!result.ok) {
      errors.push(result.error);
      continue;
    }

    const parsed = itemSchema.safeParse(result.data);
    if (!parsed.success) {
      errors.push(...formatZodIssues(filePath, parsed.error));
      continue;
    }

    const item = parsed.data;
    const expectedId = file.replace(/\.json$/, "");
    if (item.id !== expectedId) {
      errors.push(`${filePath}: 필드 'id' - 파일명(${expectedId})과 id 값('${item.id}')이 일치하지 않습니다`);
      continue;
    }
    if (itemsById.has(item.id)) {
      errors.push(`${filePath}: id '${item.id}'가 다른 파일과 중복됩니다`);
      continue;
    }
    itemsById.set(item.id, item);
  }

  if (index) {
    const orderSet = new Set(index.order);
    const fileIds = new Set(itemsById.keys());
    for (const id of index.order) {
      if (!fileIds.has(id)) errors.push(`${indexPath}: order에 있는 '${id}'에 해당하는 파일이 ${dir}에 없습니다`);
    }
    for (const id of fileIds) {
      if (!orderSet.has(id)) errors.push(`${indexPath}: ${dir}/${id}.json 파일이 order 목록에 없습니다`);
    }
  }

  if (errors.length > 0) {
    throw new ContentValidationError(`콘텐츠 검증 실패 (${errors.length}건):\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  }

  const finalIndex = index as TIndex;
  const items = finalIndex.order.map((id) => itemsById.get(id)!);
  return { index: finalIndex, items };
}
