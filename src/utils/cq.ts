import type { LogItem } from "~/logManager/types";

export type CqToken =
  | { kind: "text"; text: string }
  | { kind: "cq"; cqType: string; raw: string; data: Record<string, string> };

export interface CqFilterOptions {
  filterCqForward?: boolean;
  filterCqImage?: boolean;
  filterCqAt?: boolean;
  filterCqReply?: boolean;
  filterCqJson?: boolean;
}

type ForwardNode = {
  user_id?: string | number;
  time?: string | number;
  sender?: {
    nickname?: string;
    card?: string;
    user_id?: string | number;
  };
  nickname?: string;
  raw_message?: string;
  message?: unknown;
};

const CQ_FILTER_OPTION_MAP: Record<string, keyof CqFilterOptions> = {
  forward: "filterCqForward",
  image: "filterCqImage",
  at: "filterCqAt",
  reply: "filterCqReply",
  json: "filterCqJson",
};

export function tokenizeCqMessage(message: string): CqToken[] {
  const tokens: CqToken[] = [];
  let cursor = 0;

  while (cursor < message.length) {
    const start = message.indexOf("[CQ:", cursor);
    if (start === -1) {
      pushTextToken(tokens, message.slice(cursor));
      break;
    }

    pushTextToken(tokens, message.slice(cursor, start));
    const end = findCqSegmentEnd(message, start);
    if (end === -1) {
      pushTextToken(tokens, message.slice(start));
      break;
    }

    const raw = message.slice(start, end + 1);
    tokens.push(parseCqToken(raw));
    cursor = end + 1;
  }

  return tokens;
}

export function filterCqTypes(message: string, options: CqFilterOptions): string {
  return tokenizeCqMessage(message)
    .filter((token) => {
      if (token.kind === "text") return true;
      const optionKey = CQ_FILTER_OPTION_MAP[token.cqType];
      if (!optionKey) return true;
      return !options[optionKey];
    })
    .map((token) => (token.kind === "text" ? token.text : token.raw))
    .join("");
}

export function expandForwardLogItem(item: LogItem): LogItem[] | null {
  const tokens = tokenizeCqMessage(item.message);
  const forwardTokens = tokens.filter(
    (token): token is Extract<CqToken, { kind: "cq" }> => token.kind === "cq" && token.cqType === "forward"
  );

  if (forwardTokens.length !== 1 || tokens.some((token) => token.kind === "text" && token.text.trim() !== "")) {
    return null;
  }

  const content = forwardTokens[0].data.content;
  if (!content) {
    return null;
  }

  const nodes = parseForwardContent(content);
  if (!nodes.length) {
    return null;
  }

  return flattenForwardNodes(nodes);
}

function flattenForwardNodes(nodes: ForwardNode[]): LogItem[] {
  const items: LogItem[] = [];

  for (const node of nodes) {
    const nickname =
      node.sender?.card?.trim() ||
      node.sender?.nickname?.trim() ||
      node.nickname?.trim() ||
      "未知用户";
    const userId = node.user_id ?? node.sender?.user_id;
    const time = normalizeUnixTime(node.time);
    const message = forwardNodeMessageToString(node);

    if (!message.trim()) {
      continue;
    }

    const nestedItems = expandForwardLogItem({
      id: 0,
      nickname,
      IMUserId: userId ? String(userId) : "",
      time,
      message,
      isDice: false,
      commandId: 0,
    } as LogItem);

    if (nestedItems?.length) {
      items.push(...nestedItems);
      continue;
    }

    items.push({
      id: 0,
      nickname,
      IMUserId: userId ? String(userId) : "",
      time,
      message,
      isDice: false,
      commandId: 0,
    } as LogItem);
  }

  return items;
}

function forwardNodeMessageToString(node: ForwardNode): string {
  const structured = messageNodesToString(node.message);
  if (structured.trim()) {
    return structured;
  }
  return typeof node.raw_message === "string" ? node.raw_message : "";
}

function messageNodesToString(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((node) => {
      if (!node || typeof node !== "object") {
        return "";
      }

      const typedNode = node as { type?: string; data?: Record<string, unknown> };
      const data = typedNode.data ?? {};
      switch (typedNode.type) {
        case "text":
          return typeof data.text === "string" ? data.text : "";
        case "image":
          return buildCqString("image", data);
        case "at":
          return buildCqString("at", data);
        case "reply":
          return buildCqString("reply", data);
        case "json":
          return buildCqString("json", data);
        case "forward":
          return buildCqString("forward", data);
        default:
          return buildCqString(typedNode.type || "unknown", data);
      }
    })
    .join("");
}

function buildCqString(type: string, data: Record<string, unknown>): string {
  const attrs = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${serializeCqValue(value)}`);
  return `[CQ:${type}${attrs.length ? `,${attrs.join(",")}` : ""}]`;
}

function serializeCqValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function parseForwardContent(content: string): ForwardNode[] {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseCqToken(raw: string): CqToken {
  const inner = raw.slice(4, -1);
  const commaIndex = findTopLevelComma(inner);
  const cqType = (commaIndex === -1 ? inner : inner.slice(0, commaIndex)).trim();
  const data = commaIndex === -1 ? {} : parseTopLevelAttributes(inner.slice(commaIndex + 1));
  return { kind: "cq", cqType, raw, data };
}

function parseTopLevelAttributes(input: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of splitTopLevel(input, ",")) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) {
      result[part.trim()] = "";
      continue;
    }
    const key = part.slice(0, eqIndex).trim();
    const value = part.slice(eqIndex + 1);
    if (key) {
      result[key] = value;
    }
  }
  return result;
}

function findCqSegmentEnd(input: string, start: number): number {
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = start; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === "[") {
      depth += 1;
      continue;
    }
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function splitTopLevel(input: string, separator: string): string[] {
  const parts: string[] = [];
  let current = "";
  let bracketDepth = 0;
  let braceDepth = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      current += char;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    if (char === "{") braceDepth += 1;
    if (char === "}") braceDepth = Math.max(0, braceDepth - 1);

    if (char === separator && bracketDepth === 0 && braceDepth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

function findTopLevelComma(input: string): number {
  let bracketDepth = 0;
  let braceDepth = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    if (char === "{") braceDepth += 1;
    if (char === "}") braceDepth = Math.max(0, braceDepth - 1);

    if (char === "," && bracketDepth === 0 && braceDepth === 0) {
      return index;
    }
  }

  return -1;
}

function normalizeUnixTime(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function pushTextToken(tokens: CqToken[], text: string) {
  if (!text) return;
  tokens.push({ kind: "text", text });
}
