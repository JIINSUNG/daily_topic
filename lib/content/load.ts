// 빌드 시점에 content/topics/*.json과 content/index.json을 읽어서 zod로 검증한다.
// 하나라도 깨지면 어떤 파일의 어떤 필드가 문제인지 전부 모아서 에러를 던지고 빌드를 실패시킨다.
import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { ContentIndexSchema, TopicSchema, type ContentIndex, type Topic } from "./schema";

export interface LoadedContent {
  index: ContentIndex;
  /** index.order 순서대로 정렬된 토픽 목록. */
  topics: Topic[];
}

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

/**
 * content/index.json과 content/topics/*.json을 읽고 검증한다.
 * 문제가 하나라도 있으면 전부 모아서 ContentValidationError를 던진다(부분 실패로 조용히 넘어가지 않음).
 *
 * @param contentDir 기본값은 프로젝트 루트의 content/. 테스트에서는 고정 fixture 디렉터리를 넘긴다.
 */
export function loadContent(contentDir: string = path.join(process.cwd(), "content")): LoadedContent {
  const errors: string[] = [];
  const indexPath = path.join(contentDir, "index.json");
  const topicsDir = path.join(contentDir, "topics");

  let index: ContentIndex | null = null;
  const indexResult = readJsonFile(indexPath);
  if (!indexResult.ok) {
    errors.push(indexResult.error);
  } else {
    const parsed = ContentIndexSchema.safeParse(indexResult.data);
    if (!parsed.success) errors.push(...formatZodIssues(indexPath, parsed.error));
    else index = parsed.data;
  }

  let files: string[] = [];
  try {
    files = fs
      .readdirSync(topicsDir)
      .filter((f) => f.endsWith(".json"))
      .sort();
  } catch (e) {
    errors.push(`${topicsDir}: 디렉터리를 읽을 수 없습니다 - ${(e as Error).message}`);
  }

  const topicsById = new Map<string, Topic>();
  for (const file of files) {
    const filePath = path.join(topicsDir, file);
    const result = readJsonFile(filePath);
    if (!result.ok) {
      errors.push(result.error);
      continue;
    }

    const parsed = TopicSchema.safeParse(result.data);
    if (!parsed.success) {
      errors.push(...formatZodIssues(filePath, parsed.error));
      continue;
    }

    const topic = parsed.data;
    const expectedId = file.replace(/\.json$/, "");
    if (topic.id !== expectedId) {
      errors.push(
        `${filePath}: 필드 'id' - 파일명(${expectedId})과 id 값('${topic.id}')이 일치하지 않습니다`,
      );
      continue;
    }
    if (topicsById.has(topic.id)) {
      errors.push(`${filePath}: id '${topic.id}'가 다른 파일과 중복됩니다`);
      continue;
    }
    topicsById.set(topic.id, topic);
  }

  // index.order 순서와 실제 파일 목록이 정확히 일치하는지 양방향으로 검증한다.
  if (index) {
    const orderSet = new Set(index.order);
    const fileIds = new Set(topicsById.keys());

    for (const id of index.order) {
      if (!fileIds.has(id)) {
        errors.push(`${indexPath}: order에 있는 '${id}'에 해당하는 토픽 파일이 content/topics에 없습니다`);
      }
    }
    for (const id of fileIds) {
      if (!orderSet.has(id)) {
        errors.push(`${indexPath}: content/topics/${id}.json 파일이 order 목록에 없습니다`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ContentValidationError(
      `콘텐츠 검증 실패 (${errors.length}건):\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }

  const finalIndex = index as ContentIndex; // errors가 없다면 index 파싱은 반드시 성공했다.
  const topics = finalIndex.order.map((id) => topicsById.get(id)!);

  return { index: finalIndex, topics };
}

export function getTopicById(id: string, contentDir?: string): Topic | undefined {
  return loadContent(contentDir).topics.find((t) => t.id === id);
}
