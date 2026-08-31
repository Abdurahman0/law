// Typed client for the LexGo backend contract (FRONTEND_API.md / MOBILE_API.md).
// Every function talks to the same-origin proxy with the bearer token attached.
// UI callers wrap reads in `withFallback(...)` so the app keeps working on local
// mock data until the backend is reachable.
import { http, asDict, asStr, asNum, asArr } from "@/lib/http";
import type { ProfessionalProfile } from "@/lib/types";

// ── Auth ──────────────────────────────────────────────────────────
export type BackendRole = "client" | "advokat";
export type AuthUser = {
  id: string;
  role: BackendRole;
  name: string;
  phone: string;
  roles: string[];
  permissions: string[];
};
export type AuthResult = { token: string; user: AuthUser };

function normUser(v: unknown): AuthUser {
  const d = asDict(v);
  return {
    id: asStr(d.id ?? d.user_id),
    role: d.role === "advokat" ? "advokat" : "client",
    name: asStr(d.name),
    phone: asStr(d.phone),
    roles: asArr(d.roles).map((r) => asStr(r)),
    permissions: asArr(d.permissions).map((p) => asStr(p)),
  };
}

function normAuth(v: unknown): AuthResult {
  const d = asDict(v);
  return {
    token: asStr(d.access_token ?? d.token),
    user: normUser(d.user ?? d),
  };
}

export async function apiRegister(input: {
  role: BackendRole;
  name: string;
  phone: string;
  password: string;
}): Promise<AuthResult> {
  const data = await http("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const res = normAuth(data);
  // Some backends return only a success flag on register — log in for a token.
  if (!res.token) return apiLogin(input.phone, input.password);
  return res;
}

export async function apiLogin(phone: string, password: string): Promise<AuthResult> {
  return normAuth(
    await http("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),
  );
}

export async function apiMe(): Promise<AuthUser> {
  return normUser(await http("/auth/me"));
}

// ── Lawyer profiles ───────────────────────────────────────────────
export type BackendLawyer = {
  id: string;
  name: string;
  region: string;
  district?: string;
  specializations: string[];
  languages: string[];
  experienceYears: number;
  rating: number;
  reviews: number;
  basePrice: number;
  bio?: string;
  verified: boolean;
};

function normLawyer(v: unknown): BackendLawyer {
  const d = asDict(v);
  const user = asDict(d.user);
  return {
    id: asStr(d.id ?? d.user_id ?? user.id),
    name: asStr(d.lawyer_name ?? d.name ?? user.name ?? d.full_name),
    region: asStr(d.region),
    district: asStr(d.district) || undefined,
    specializations: asArr(d.specializations).map((s) => asStr(s)),
    languages: asArr(d.languages).map((l) => asStr(l)),
    experienceYears: asNum(d.experience_years),
    rating: asNum(d.rating, 5),
    reviews: asNum(d.reviews_count ?? d.reviews),
    basePrice: asNum(d.base_hourly_price),
    bio: asStr(d.bio) || undefined,
    verified: Boolean(d.verified ?? d.is_verified),
  };
}

export async function listLawyers(filters?: {
  region?: string;
  specialization?: string;
}): Promise<BackendLawyer[]> {
  const qs = new URLSearchParams();
  if (filters?.region) qs.set("region", filters.region);
  if (filters?.specialization) qs.set("specialization", filters.specialization);
  const q = qs.toString();
  const data = await http(`/lawyers${q ? `?${q}` : ""}`);
  return listFrom(data, "lawyers", "items", "data").map(normLawyer);
}

// My offered services (GET/PUT /lawyers/me/services). Stored as service ids.
export async function getMyServices(): Promise<string[]> {
  const d = asDict(await http("/lawyers/me/services"));
  return asArr(d.services).map((v) => {
    const s = asDict(v);
    return asStr(s.id ?? s.service_id ?? v);
  });
}

export async function putMyServices(serviceIds: string[]): Promise<void> {
  await http("/lawyers/me/services", {
    method: "PUT",
    body: JSON.stringify({ service_ids: serviceIds }),
  });
}

// Build the PUT /lawyers/me body from our onboarding profile.
export async function upsertMyLawyer(p: ProfessionalProfile): Promise<unknown> {
  return http("/lawyers/me", {
    method: "PUT",
    body: JSON.stringify({
      region: p.region ?? "",
      district: "",
      license_number: p.licenseNumber ?? "",
      bar_association: p.barAssociation ?? "",
      experience_years: p.experienceYears ?? 0,
      specializations: p.practiceAreas,
      languages: p.languages,
      bio: p.bio ?? "",
      education: p.education ?? "",
      wins_count: p.stats?.casesWon ?? 0,
      partial_wins_count: 0,
      base_hourly_price: 0,
    }),
  });
}

// ── Service catalog ───────────────────────────────────────────────
export type BackendService = {
  id: string;
  name: string;
  categoryId?: string;
  price?: number;
  description?: string;
};
export type BackendCategory = { id: string; name: string };

function normService(v: unknown): BackendService {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: asStr(d.title ?? d.name),
    categoryId: asStr(d.category_id ?? d.categoryId) || undefined,
    price: d.base_price != null ? asNum(d.base_price) : undefined,
    description: asStr(d.description) || undefined,
  };
}

export async function getServiceCategories(): Promise<BackendCategory[]> {
  const data = await http("/service-categories");
  return listFrom(data, "categories", "items", "data").map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), name: asStr(d.name ?? d.title) };
  });
}

export async function getServices(): Promise<BackendService[]> {
  const data = await http("/services");
  return listFrom(data, "services", "items", "data").map(normService);
}

// ── Subscription plans ────────────────────────────────────────────
export type BackendPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

export async function getSubscriptionPlans(): Promise<BackendPlan[]> {
  const data = await http("/subscription-plans");
  return listFrom(data, "plans", "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id),
      name: asStr(d.title ?? d.name),
      price: asNum(d.monthly_price ?? d.price),
      features: asArr(d.benefits ?? d.features).map((f) => asStr(f)),
    };
  });
}

// ── Orders & cases ────────────────────────────────────────────────
export type BackendCase = {
  id: string;
  caseNumber: string;
  caseType: string;
  stage: string;
  status: string;
  nextAction: string;
  deadlineAt?: string;
};

function normCase(v: unknown): BackendCase {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    caseNumber: asStr(d.case_number ?? d.caseNumber),
    caseType: asStr(d.title ?? d.case_type ?? d.caseType),
    stage: asStr(d.stage),
    status: asStr(d.status),
    nextAction: asStr(d.next_action ?? d.nextAction),
    deadlineAt: asStr(d.deadline_at ?? d.deadlineAt) || undefined,
  };
}

export type BackendOrder = {
  id: string;
  title: string;
  serviceName: string;
  status: string;
  areaKey: string;
  region: string;
  budget: string;
  createdAt: string;
  lawyerName?: string;
};

function normOrder(v: unknown): BackendOrder {
  const d = asDict(v);
  const details = asDict(d.details);
  const service = asDict(d.service);
  return {
    id: asStr(d.id),
    title: asStr(details.question ?? d.title ?? service.name),
    serviceName: asStr(service.name ?? d.service_name),
    status: asStr(d.status),
    areaKey: asStr(d.area ?? service.category ?? details.area),
    region: asStr(d.region ?? details.region),
    budget: asStr(d.amount ?? d.price ?? details.budget),
    createdAt: asStr(d.created_at ?? d.createdAt),
    lawyerName: asStr(d.lawyer_name ?? asDict(d.lawyer).name) || undefined,
  };
}

export async function listOrders(): Promise<BackendOrder[]> {
  return listFrom(await http("/orders"), "orders", "items", "data").map(normOrder);
}

export async function createOrder(input: {
  service_id: string;
  lawyer_user_id?: string;
  source?: string;
  details?: Record<string, unknown>;
}): Promise<unknown> {
  return http("/orders", {
    method: "POST",
    body: JSON.stringify({ source: "web", ...input }),
  });
}

export async function listCases(): Promise<BackendCase[]> {
  return listFrom(await http("/cases"), "cases", "items", "data").map(normCase);
}

export async function createCase(input: Record<string, unknown>): Promise<unknown> {
  return http("/cases", { method: "POST", body: JSON.stringify(input) });
}

// ── Payments ──────────────────────────────────────────────────────
export type PaymentProvider = "payme" | "click" | "rahmat";
export async function createPayment(input: {
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  provider_payload?: Record<string, unknown>;
}): Promise<{ id: string }> {
  const d = asDict(
    await http("/payments", {
      method: "POST",
      body: JSON.stringify({ currency: "UZS", provider_payload: {}, ...input }),
    }),
  );
  return { id: asStr(d.id) };
}

// ── Document templates ────────────────────────────────────────────
export type BackendTemplate = {
  id: string;
  name: string;
  category: string;
  language: string;
  price: number;
};

export async function getDocumentTemplates(): Promise<BackendTemplate[]> {
  return listFrom(await http("/document-templates"), "templates", "items", "data").map(
    (v) => {
      const d = asDict(v);
      return {
        id: asStr(d.id),
        name: asStr(d.name ?? d.title),
        category: asStr(d.category),
        language: asStr(d.language),
        price: asNum(d.price),
      };
    },
  );
}

// ── helpers ───────────────────────────────────────────────────────
function listFrom(data: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  const d = asDict(data);
  for (const k of keys) if (Array.isArray(d[k])) return d[k] as unknown[];
  return [];
}
