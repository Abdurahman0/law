// Typed client for the LexGo backend contract (FRONTEND_API.md / MOBILE_API.md).
// Every function talks to the same-origin proxy with the bearer token attached.
// UI callers wrap reads in `withFallback(...)` so the app keeps working on local
// mock data until the backend is reachable.
import { http, asDict, asStr, asNum, asArr, API_BASE, type Dict } from "@/lib/http";
import type { ProfessionalProfile } from "@/lib/types";

// ── Auth ──────────────────────────────────────────────────────────
export type BackendRole =
  | "client"
  | "yurist"
  | "advokat"
  | "advokat_tashkiloti"
  | "admin"
  | "manager"
  | "call_center"
  | "sales";
export type AuthUser = {
  id: string;
  role: BackendRole;
  name: string;
  phone: string;
  roles: string[];
  permissions: string[];
};
export type AuthResult = { token: string; user: AuthUser };

const ROLE_SET: BackendRole[] = [
  "client", "yurist", "advokat", "advokat_tashkiloti", "admin", "manager", "call_center", "sales",
];
function normUser(v: unknown): AuthUser {
  const d = asDict(v);
  const rawRole = asStr(d.role) as BackendRole;
  return {
    id: asStr(d.id ?? d.user_id),
    role: ROLE_SET.includes(rawRole) ? rawRole : "client",
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

// Two-step OTP registration (LEXGO_FRONTEND_UPDATE.md).
export type RegisterStartResult = {
  verificationId: string;
  phone: string;
  demoOtp: string;
  expiresAt: string;
  message: string;
};
export async function registerStart(input: {
  role: BackendRole;
  name: string;
  phone: string;
  password: string;
}): Promise<RegisterStartResult> {
  const d = asDict(await http("/auth/register/start", { method: "POST", body: JSON.stringify(input) }));
  return {
    verificationId: asStr(d.verification_id),
    phone: asStr(d.phone),
    demoOtp: asStr(d.demo_otp),
    expiresAt: asStr(d.expires_at),
    message: asStr(d.message),
  };
}
export async function registerVerify(verificationId: string, code: string): Promise<AuthResult> {
  return normAuth(
    await http("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify({ verification_id: verificationId, code }),
    }),
  );
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
  userId: string;
  name: string;
  phone: string;
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
    userId: asStr(d.user_id ?? user.id ?? d.id),
    name: asStr(d.lawyer_name ?? d.name ?? user.name ?? d.full_name),
    phone: asStr(d.phone ?? user.phone),
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

export async function putMyServices(
  serviceIds: string[],
  selectedPrices: Record<string, number> = {},
): Promise<void> {
  await http("/lawyers/me/services", {
    method: "PUT",
    body: JSON.stringify({ service_ids: serviceIds, selected_prices: selectedPrices }),
  });
}

// Build the PUT /lawyers/me body from our onboarding profile.
export async function upsertMyLawyer(
  p: ProfessionalProfile,
  sellerType?: "yurist" | "advokat" | "advokat_tashkiloti",
): Promise<unknown> {
  return http("/lawyers/me", {
    method: "PUT",
    body: JSON.stringify({
      seller_type: sellerType,
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
  slug: string;
  categoryId?: string;
  categoryTitle?: string;
  price?: number;
  description?: string;
  isActive: boolean;
  // LexGo catalog metadata
  catalogCode?: string;
  executorType?: string;
  advokatRequired: boolean;
  pricingTier?: string;
};
export type BackendCategory = { id: string; name: string; slug: string };

// Prefer a localized catalog title for the current UI language.
function serviceTitle(d: Dict, locale: string): string {
  const byLocale =
    locale === "ru"
      ? d.title_ru
      : locale === "en"
        ? d.title_uz_latn // no EN catalog title; latin is the closest neutral
        : d.title_uz_latn;
  return asStr(byLocale ?? d.title ?? d.name);
}

function normService(v: unknown, locale = "uz"): BackendService {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: serviceTitle(d, locale),
    slug: asStr(d.slug),
    categoryId: asStr(d.category_id ?? d.categoryId) || undefined,
    categoryTitle: asStr(d.category_title) || undefined,
    price: d.standard_price != null ? asNum(d.standard_price) : d.base_price != null ? asNum(d.base_price) : undefined,
    description: asStr(d.description) || undefined,
    isActive: d.is_active !== false,
    catalogCode: asStr(d.catalog_code) || undefined,
    executorType: asStr(d.executor_type) || undefined,
    advokatRequired: Boolean(d.advokat_required),
    pricingTier: asStr(d.pricing_tier) || undefined,
  };
}

export type ServiceFilters = {
  category_id?: string;
  q?: string;
  executor_type?: string;
  catalog_only?: boolean;
};

export async function getServiceCategories(): Promise<BackendCategory[]> {
  const data = await http("/service-categories");
  return listFrom(data, "categories", "items", "data").map((v) => {
    const d = asDict(v);
    return { id: asStr(d.id), name: asStr(d.title ?? d.name), slug: asStr(d.slug) };
  });
}

export async function getServices(filters?: ServiceFilters, locale = "uz"): Promise<BackendService[]> {
  const qs = new URLSearchParams();
  if (filters?.category_id) qs.set("category_id", filters.category_id);
  if (filters?.q) qs.set("q", filters.q);
  if (filters?.executor_type) qs.set("executor_type", filters.executor_type);
  if (filters?.catalog_only != null) qs.set("catalog_only", String(filters.catalog_only));
  const q = qs.toString();
  const data = await http(`/services${q ? `?${q}` : ""}`);
  return listFrom(data, "services", "items", "data").map((v) => normService(v, locale));
}

// Package tariffs (GET /service-packages).
export type BackendPackage = {
  id: string;
  code: string;
  title: string;
  tariff: string;
  price: number;
};
export async function getServicePackages(params?: { package_code?: string; tariff?: string }): Promise<BackendPackage[]> {
  const qs = new URLSearchParams();
  if (params?.package_code) qs.set("package_code", params.package_code);
  if (params?.tariff) qs.set("tariff", params.tariff);
  const q = qs.toString();
  const data = await http(`/service-packages${q ? `?${q}` : ""}`);
  return listFrom(data, "packages", "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id),
      code: asStr(d.package_code ?? d.code),
      title: asStr(d.title ?? d.name),
      tariff: asStr(d.tariff),
      price: asNum(d.price ?? d.standard_price),
    };
  });
}

// ── Subscription plans ────────────────────────────────────────────
export type BackendPlan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  features: string[];
  isGiftable: boolean;
  isActive: boolean;
};

export async function getSubscriptionPlans(): Promise<BackendPlan[]> {
  const data = await http("/subscription-plans");
  return listFrom(data, "plans", "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id),
      name: asStr(d.title ?? d.name),
      slug: asStr(d.slug),
      price: asNum(d.monthly_price ?? d.price),
      features: asArr(d.benefits ?? d.features).map((f) => asStr(f)),
      isGiftable: Boolean(d.is_giftable),
      isActive: d.is_active !== false,
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
  paymentStatus: string;
  contactUnlocked: boolean;
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
    paymentStatus: asStr(d.payment_status),
    contactUnlocked: Boolean(d.contact_unlocked),
    areaKey: asStr(d.area ?? service.category ?? details.area),
    region: asStr(d.region ?? details.region),
    budget: asStr(d.price ?? d.amount ?? details.budget),
    createdAt: asStr(d.created_at ?? d.createdAt),
    lawyerName: asStr(d.lawyer_name ?? asDict(d.lawyer).name) || undefined,
  };
}

export async function listOrders(): Promise<BackendOrder[]> {
  return listFrom(await http("/orders"), "orders", "items", "data").map(normOrder);
}

export async function createOrder(input: {
  service_id: string;
  package_id?: string;
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

// ── Demo purchase flows (LEXGO_FRONTEND_UPDATE.md) ────────────────
export type PurchaseResult = {
  paymentId: string;
  paymentStatus: string;
  orderId?: string;
  chatRoomId?: string;
  subscriptionId?: string;
};
function normPurchase(v: unknown): PurchaseResult {
  const d = asDict(v);
  const payment = asDict(d.payment);
  const room = asDict(d.chat_room);
  const order = asDict(d.order);
  return {
    paymentId: asStr(payment.id),
    paymentStatus: asStr(payment.status),
    orderId: asStr(order.id) || undefined,
    chatRoomId: asStr(room.id) || undefined,
    subscriptionId: asStr(d.subscription_id) || undefined,
  };
}
export async function demoPurchase(input: {
  service_id: string;
  lawyer_user_id: string;
  package_id?: string;
  provider?: string;
  details?: Record<string, unknown>;
}): Promise<PurchaseResult> {
  return normPurchase(
    await http("/orders/demo-purchase", { method: "POST", body: JSON.stringify({ provider: "demo_payme", ...input }) }),
  );
}
export async function demoPayOrder(orderId: string, provider = "demo_payme"): Promise<PurchaseResult> {
  return normPurchase(
    await http(`/orders/${orderId}/demo-pay?provider=${encodeURIComponent(provider)}`, { method: "POST" }),
  );
}
export async function demoPrivateChat(input: {
  lawyer_user_id: string;
  amount?: number;
  provider?: string;
  title?: string;
}): Promise<PurchaseResult> {
  return normPurchase(
    await http("/payments/demo-private-chat", {
      method: "POST",
      body: JSON.stringify({ amount: 0, provider: "demo_payme", title: "Private chat", ...input }),
    }),
  );
}
export async function demoPlanPurchase(
  planId: string,
  input: { provider?: string; billing_period?: string; family_members?: unknown[] } = {},
): Promise<PurchaseResult> {
  return normPurchase(
    await http(`/subscription-plans/${planId}/demo-purchase`, {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, provider: "demo_payme", billing_period: "monthly", family_members: [], ...input }),
    }),
  );
}
export async function demoConfirmPayment(paymentId: string): Promise<PurchaseResult> {
  return normPurchase(await http(`/payments/${paymentId}/demo-confirm`, { method: "POST" }));
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
  slug: string;
  category: string;
  language: string;
  price: number;
  isActive: boolean;
};

export async function getDocumentTemplates(): Promise<BackendTemplate[]> {
  return listFrom(await http("/document-templates"), "templates", "items", "data").map(
    (v) => {
      const d = asDict(v);
      return {
        id: asStr(d.id),
        name: asStr(d.title ?? d.name),
        slug: asStr(d.slug),
        category: asStr(d.category),
        language: asStr(d.language),
        price: asNum(d.price),
        isActive: d.is_active !== false,
      };
    },
  );
}

// ── Document requests (contract/application flow) ─────────────────
export type ContractFile = {
  id: string;
  fileName: string;
  mimeType: string;
  fileBase64: string;
  inlineUrl: string;
  downloadUrl: string;
};
export type DocumentRequest = {
  id: string;
  title: string;
  documentType: string;
  status: string; // draft | awaiting_payment | file_ready | ...
  price: number;
  currency: string;
  questionnaire: { name: string; label: string; required?: boolean }[];
  answers: Record<string, unknown>;
  contractFile?: ContractFile;
};

function normDocRequest(v: unknown): DocumentRequest {
  const d = asDict(v);
  const cf = d.contract_file ? asDict(d.contract_file) : null;
  return {
    id: asStr(d.id),
    title: asStr(d.title),
    documentType: asStr(d.document_type ?? d.documentType),
    status: asStr(d.status),
    price: asNum(d.price),
    currency: asStr(d.currency, "UZS"),
    questionnaire: asArr(d.questionnaire).map((q) => {
      const x = asDict(q);
      return { name: asStr(x.name), label: asStr(x.label), required: Boolean(x.required) };
    }),
    answers: (d.answers as Record<string, unknown>) ?? {},
    contractFile: cf
      ? {
          id: asStr(cf.id),
          fileName: asStr(cf.file_name),
          mimeType: asStr(cf.mime_type, "application/pdf"),
          fileBase64: asStr(cf.file_base64),
          inlineUrl: asStr(cf.inline_url),
          downloadUrl: asStr(cf.download_url),
        }
      : undefined,
  };
}

export async function createDocumentRequest(input: {
  template_id?: string;
  order_id?: string;
  document_type: string;
  title: string;
  questionnaire?: { name: string; label: string; required?: boolean }[];
  answers?: Record<string, unknown>;
  price?: number;
  currency?: string;
}): Promise<DocumentRequest> {
  return normDocRequest(
    await http("/document-requests", { method: "POST", body: JSON.stringify({ currency: "UZS", ...input }) }),
  );
}
export async function updateDocumentAnswers(
  requestId: string,
  answers: Record<string, unknown>,
): Promise<DocumentRequest> {
  return normDocRequest(
    await http(`/document-requests/${requestId}/answers`, { method: "PUT", body: JSON.stringify({ answers }) }),
  );
}
export async function payDocumentRequest(
  requestId: string,
  provider: "payme" | "click",
): Promise<DocumentRequest> {
  return normDocRequest(
    await http(`/document-requests/${requestId}/payments`, { method: "POST", body: JSON.stringify({ provider }) }),
  );
}
export async function getDocumentRequest(requestId: string): Promise<DocumentRequest> {
  return normDocRequest(await http(`/document-requests/${requestId}`));
}

// ── Organizations (advocate orgs) ─────────────────────────────────
export async function listOrganizations(): Promise<unknown[]> {
  return listFrom(await http("/organizations"), "organizations", "items", "data");
}
export async function createOrganization(input: Record<string, unknown>): Promise<unknown> {
  return http("/organizations", { method: "POST", body: JSON.stringify(input) });
}
export async function listOrgMembers(orgId: string): Promise<unknown[]> {
  return listFrom(await http(`/organizations/${orgId}/members`), "members", "items", "data");
}
export async function addOrgMember(orgId: string, input: Record<string, unknown>): Promise<unknown> {
  return http(`/organizations/${orgId}/members`, { method: "POST", body: JSON.stringify(input) });
}

// ── Secure chat ───────────────────────────────────────────────────
export type SecureMessage = {
  id: string;
  senderId: string;
  filteredContent: string;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: string;
};
function normSecureMsg(v: unknown): SecureMessage {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    senderId: asStr(d.sender_user_id ?? d.sender_id ?? d.senderId),
    filteredContent: asStr(d.filtered_content ?? d.content),
    isBlocked: Boolean(d.is_blocked),
    blockReason: asStr(d.block_reason) || undefined,
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}
export async function listSecureChats(): Promise<unknown[]> {
  return listFrom(await http("/secure-chats"), "rooms", "items", "data");
}
export async function createSecureChat(input: Record<string, unknown>): Promise<unknown> {
  return http("/secure-chats", { method: "POST", body: JSON.stringify(input) });
}
export async function getSecureMessages(roomId: string): Promise<SecureMessage[]> {
  return listFrom(await http(`/secure-chats/${roomId}/messages`), "messages", "items", "data").map(normSecureMsg);
}
export async function sendSecureMessage(roomId: string, content: string): Promise<SecureMessage> {
  return normSecureMsg(
    await http(`/secure-chats/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message_type: "text", content }),
    }),
  );
}
export function secureSocketUrl(roomId: string, token?: string | null): string {
  const base = API_BASE.replace(/^http/i, "ws");
  const q = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${base}/ws/secure-chats/${roomId}${q}`;
}

// ── Approvals (four-eyes) ─────────────────────────────────────────
export type Approval = {
  id: string;
  type: string;
  status: string;
  adminApproved: boolean;
  managerApproved: boolean;
  createdAt: string;
};
function normApproval(v: unknown): Approval {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    type: asStr(d.request_type ?? d.type ?? d.kind),
    status: asStr(d.status),
    adminApproved: !!(d.admin_approved_by_user_id ?? d.admin_approved),
    managerApproved: !!(d.manager_approved_by_user_id ?? d.manager_approved),
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}
export async function listApprovals(): Promise<Approval[]> {
  return listFrom(await http("/approvals"), "approvals", "items", "data").map(normApproval);
}
export async function createApproval(input: Record<string, unknown>): Promise<unknown> {
  return http("/approvals", { method: "POST", body: JSON.stringify(input) });
}
export async function adminApprove(id: string): Promise<Approval> {
  return normApproval(await http(`/approvals/${id}/admin-approve`, { method: "POST" }));
}
export async function managerApprove(id: string): Promise<Approval> {
  return normApproval(await http(`/approvals/${id}/manager-approve`, { method: "POST" }));
}

// ── Leads ─────────────────────────────────────────────────────────
export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  category: string;
  region: string;
  urgency: string;
  note: string;
  status: string;
  score: number;
  createdAt: string;
};
function normLead(v: unknown): Lead {
  const d = asDict(v);
  const det = asDict(d.details);
  return {
    id: asStr(d.id),
    name: asStr(det.name ?? d.name),
    phone: asStr(det.phone ?? d.phone),
    source: asStr(d.source),
    category: asStr(d.category),
    region: asStr(d.region),
    urgency: asStr(d.urgency),
    note: asStr(det.note ?? det.message ?? d.note),
    status: asStr(d.status),
    score: asNum(d.score),
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}
// Contact info is carried in `details` (the schema has no top-level name/phone).
export async function createLead(input: {
  name: string;
  phone: string;
  note?: string;
  category?: string;
  region?: string;
  urgency?: string;
}): Promise<unknown> {
  return http("/leads", {
    method: "POST",
    body: JSON.stringify({
      source: "web",
      category: input.category,
      region: input.region,
      urgency: input.urgency,
      details: { name: input.name, phone: input.phone, note: input.note ?? "" },
    }),
  });
}
export async function listLeads(): Promise<Lead[]> {
  return listFrom(await http("/admin/leads"), "leads", "items", "data").map(normLead);
}
// Admin manual lead management.
export async function adminCreateLead(input: {
  name?: string;
  phone?: string;
  note?: string;
  source?: string;
  category?: string;
  region?: string;
  urgency?: string;
}): Promise<Lead> {
  return normLead(
    await http("/admin/leads", {
      method: "POST",
      body: JSON.stringify({
        source: input.source || "manual",
        category: input.category || "",
        region: input.region || "",
        urgency: input.urgency || "",
        details: { name: input.name || "", phone: input.phone || "", note: input.note || "" },
      }),
    }),
  );
}
export async function adminUpdateLead(leadId: string, patch: Record<string, unknown>): Promise<Lead> {
  return normLead(await http(`/admin/leads/${leadId}`, { method: "PATCH", body: JSON.stringify(patch) }));
}
export async function adminDeleteLead(leadId: string): Promise<void> {
  await http(`/admin/leads/${leadId}`, { method: "DELETE" });
}

// ── Admin dashboard ───────────────────────────────────────────────
export type DashboardStat = { label: string; value: number };
export type DashboardChart = { key: string; points: { label: string; value: number }[] };
export type AdminDashboard = {
  totals: DashboardStat[];
  charts: DashboardChart[];
};
function toStats(obj: unknown): DashboardStat[] {
  const d = asDict(obj);
  return Object.entries(d)
    .filter(([, v]) => typeof v === "number" || typeof v === "string")
    .map(([label, v]) => ({ label, value: asNum(v) }));
}
export async function getAdminDashboard(): Promise<AdminDashboard> {
  const d = asDict(await http("/admin/dashboard"));
  const totals = [
    ...toStats(d.totals),
    ...toStats(d.payments),
    ...toStats(d.orders),
    ...toStats(d.leads),
    ...toStats(d.sellers),
  ];
  const chartsObj = asDict(d.charts);
  const charts: DashboardChart[] = Object.entries(chartsObj).map(([key, val]) => {
    const arr = asArr(val).map((p) => {
      const x = asDict(p);
      return {
        label: asStr(x.label ?? x.date ?? x.day ?? x.name ?? x.key),
        value: asNum(x.value ?? x.count ?? x.total ?? x.amount),
      };
    });
    return { key, points: arr };
  });
  return { totals, charts };
}

// ── Seller verification / admin actions ───────────────────────────
export async function requestVerification(input: Record<string, unknown> = {}): Promise<unknown> {
  return http("/lawyers/me/verifications", { method: "POST", body: JSON.stringify(input) });
}
export async function adminVerifyLawyer(lawyerUserId: string): Promise<unknown> {
  return http(`/admin/lawyers/${lawyerUserId}/verify`, { method: "POST" });
}
export async function adminMarkPaid(paymentId: string): Promise<unknown> {
  return http(`/admin/payments/${paymentId}/mark-paid`, { method: "POST" });
}

// ── helpers ───────────────────────────────────────────────────────
function listFrom(data: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  const d = asDict(data);
  for (const k of keys) if (Array.isArray(d[k])) return d[k] as unknown[];
  return [];
}
