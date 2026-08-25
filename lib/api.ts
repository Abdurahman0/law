// Client for the LawProject AI backend (see FRONTEND_API.md).
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.1.17:8000";

export type Source = {
  title?: string;
  url?: string;
  snippet?: string;
};

export type ApiMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  createdAt?: string;
};

export type ApiChat = {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt?: string;
};

type Dict = Record<string, unknown>;
const asDict = (v: unknown): Dict => (v && typeof v === "object" ? (v as Dict) : {});
const asStr = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : v == null ? fallback : String(v);

async function req(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function normSources(v: unknown): Source[] {
  if (!Array.isArray(v)) return [];
  return v.map((s) => {
    if (typeof s === "string") return { title: s };
    const d = asDict(s);
    return {
      title: asStr(d.title ?? d.name ?? d.document ?? d.source, ""),
      url: typeof d.url === "string" ? d.url : undefined,
      snippet: typeof d.snippet === "string" ? d.snippet : undefined,
    };
  });
}

export function normMessage(v: unknown): ApiMessage {
  const d = asDict(v);
  const role = d.role === "user" ? "user" : "assistant";
  return {
    id: d.id != null ? String(d.id) : undefined,
    role,
    content: asStr(d.content ?? d.text, ""),
    sources: normSources(d.sources),
    createdAt: typeof d.created_at === "string" ? d.created_at : undefined,
  };
}

function normChat(v: unknown): ApiChat {
  const d = asDict(v);
  const last = d.last_message ?? d.lastMessage;
  const lastStr =
    typeof last === "string" ? last : asStr(asDict(last).content, "");
  return {
    id: String(d.id ?? d.chat_id ?? ""),
    title: asStr(d.title, ""),
    lastMessage: lastStr || undefined,
    updatedAt: typeof d.updated_at === "string" ? d.updated_at : undefined,
  };
}

function listFrom(data: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  const d = asDict(data);
  for (const k of keys) if (Array.isArray(d[k])) return d[k] as unknown[];
  return [];
}

export async function listChats(clientId: string): Promise<ApiChat[]> {
  const data = await req(`/clients/${clientId}/chats`);
  return listFrom(data, "chats", "items", "data").map(normChat);
}

export async function createChat(
  clientId: string,
  title: string,
): Promise<ApiChat> {
  const data = await req(`/clients/${clientId}/chats`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return normChat(data);
}

export async function getChatMessages(
  clientId: string,
  chatId: string,
): Promise<ApiMessage[]> {
  const data = await req(`/clients/${clientId}/chats/${chatId}`);
  return listFrom(data, "messages", "items", "data").map(normMessage);
}

export async function postMessage(
  clientId: string,
  chatId: string,
  content: string,
): Promise<{ assistant: ApiMessage; sources: Source[] }> {
  const data = await req(`/clients/${clientId}/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  const d = asDict(data);
  const assistant = normMessage(
    d.assistant_message ?? { role: "assistant", content: d.content },
  );
  const sources = assistant.sources?.length
    ? assistant.sources
    : normSources(d.sources);
  return { assistant: { ...assistant, sources }, sources };
}

export function chatSocketUrl(clientId: string, chatId: string): string {
  const base = API_BASE.replace(/^http/i, "ws");
  return `${base}/ws/clients/${clientId}/chats/${chatId}`;
}
