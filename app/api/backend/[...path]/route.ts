import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Long-running LLM/contract calls must not be cut off.
export const maxDuration = 300;

const BACKEND = process.env.BACKEND_ORIGIN || "http://192.168.1.17:8000";

// Same-origin proxy to the LawProject AI backend (avoids browser CORS and
// private-network restrictions). Streams status/body/content-type through.
async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const search = req.nextUrl.search || "";
  const target = `${BACKEND}/${(path || []).join("/")}${search}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let res: Response;
  try {
    res = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch {
    return new Response(JSON.stringify({ error: "backend_unreachable" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const buf = await res.arrayBuffer();
  const out = new Headers();
  const passType = res.headers.get("content-type");
  if (passType) out.set("content-type", passType);
  const disp = res.headers.get("content-disposition");
  if (disp) out.set("content-disposition", disp);
  return new Response(buf, { status: res.status, headers: out });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
};
