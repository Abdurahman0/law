// Typed client for the LexGo backend contract (FRONTEND_API.md / MOBILE_API.md).
// Every function talks to the same-origin proxy with the bearer token attached.
// UI callers wrap reads in `withFallback(...)` so the app keeps working on local
// mock data until the backend is reachable.
import { http, asDict, asStr, asNum, asArr, API_BASE, ApiError, absUrl, backendOrigin, backendUrl, type Dict } from "@/lib/http";
import { getToken } from "@/lib/client";
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

// Two-step OTP registration. /auth/register now behaves like /auth/register/start
// (returns a verification + demo_otp); we use the explicit /start endpoint.
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
  firstName?: string;
  lastName?: string;
  phone: string;
  password: string;
}): Promise<RegisterStartResult> {
  const { firstName, lastName, ...rest } = input;
  const body = {
    ...rest,
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
  };
  const d = asDict(await http("/auth/register/start", { method: "POST", body: JSON.stringify(body) }));
  return {
    verificationId: asStr(d.verification_id),
    phone: asStr(d.phone),
    demoOtp: asStr(d.demo_otp),
    expiresAt: asStr(d.expires_at),
    message: asStr(d.message),
  };
}
// Seller registration is approval-based: verify does NOT return a token for
// seller roles — it queues a request for admin review.
export type RegisterVerifyResult =
  | { pending: false; token: string; user: AuthUser }
  | { pending: true; requestId: string; status: string; role: string; message: string };

export async function registerVerify(verificationId: string, code: string): Promise<RegisterVerifyResult> {
  const d = asDict(
    await http("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify({ verification_id: verificationId, code }),
    }),
  );
  const token = asStr(d.access_token ?? d.token);
  if (!token || asStr(d.status) === "pending" || d.request_id) {
    return {
      pending: true,
      requestId: asStr(d.request_id),
      status: asStr(d.status, "pending"),
      role: asStr(d.role),
      message: asStr(d.message),
    };
  }
  return { pending: false, token, user: normUser(d.user ?? d) };
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
  verificationStatus: string;
  sellerType: string;
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
    verificationStatus: asStr(d.verification_status),
    sellerType: asStr(d.seller_type),
  };
}

export async function listLawyers(filters?: {
  region?: string;
  specialization?: string;
  service_id?: string;
}): Promise<BackendLawyer[]> {
  const qs = new URLSearchParams();
  if (filters?.region) qs.set("region", filters.region);
  if (filters?.specialization) qs.set("specialization", filters.specialization);
  if (filters?.service_id) qs.set("service_id", filters.service_id);
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
      advocate_structure: p.advocateStructure ?? "",
      organization_name: p.orgName ?? "",
      experience_years: p.advocateYears ?? p.experienceYears ?? 0,
      lawyer_experience_years: p.lawyerYears ?? 0,
      specializations: p.practiceAreas,
      languages: p.languages,
      bio: p.bio ?? "",
      education: p.education ?? "",
      wins_count: p.stats?.fullyWonCases ?? 0,
      partial_wins_count: p.stats?.partiallyWonCases ?? 0,
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
// Prices follow the TZ model: monthly base, 6-month, yearly (−10%/mo) and
// prepaid-yearly (a further −10%). All amounts are admin-managed on the backend.
export type BackendPlan = {
  id: string;
  name: string;
  slug: string;
  price: number; // monthly (back-compat alias)
  monthlyPrice: number;
  sixMonthPrice: number;
  yearlyPrice: number;
  prepaidYearlyPrice: number;
  audience: string;
  description: string;
  features: string[];
  isGiftable: boolean;
  isActive: boolean;
};

export async function getSubscriptionPlans(): Promise<BackendPlan[]> {
  const data = await http("/subscription-plans");
  return listFrom(data, "plans", "items", "data").map((v) => {
    const d = asDict(v);
    const monthly = asNum(d.monthly_price ?? d.price);
    return {
      id: asStr(d.id),
      name: asStr(d.title ?? d.name),
      slug: asStr(d.slug),
      price: monthly,
      monthlyPrice: monthly,
      sixMonthPrice: asNum(d.six_month_price),
      yearlyPrice: asNum(d.yearly_price),
      prepaidYearlyPrice: asNum(d.prepaid_yearly_price),
      audience: asStr(d.audience),
      description: asStr(d.description),
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
  title: string;
  description: string;
  clientUserId?: string;
  lawyerUserId?: string;
  orderId?: string;
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
    title: asStr(d.title ?? d.case_type),
    description: asStr(d.description),
    clientUserId: asStr(d.client_user_id) || undefined,
    lawyerUserId: asStr(d.lawyer_user_id) || undefined,
    orderId: asStr(d.order_id) || undefined,
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

// Orders still open for a seller to take — the marketplace/opportunities feeds.
// Already accepted/declined/closed orders belong in "my cases", not here.
const TAKEN_ORDER_STATUSES = new Set([
  "accepted",
  "declined",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
  "canceled",
  "closed",
  "done",
]);
export async function listOpenOrders(): Promise<BackendOrder[]> {
  return (await listOrders()).filter((o) => !TAKEN_ORDER_STATUSES.has((o.status || "").toLowerCase()));
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
  paymentUrl?: string;
  orderId?: string;
  chatRoomId?: string;
  subscriptionId?: string;
};
function normPurchase(v: unknown): PurchaseResult {
  const d = asDict(v);
  const payment = asDict(d.payment);
  // Backend returns both `chat_room` and `room` for compatibility.
  const room = asDict(d.chat_room ?? d.room);
  const order = asDict(d.order);
  return {
    paymentId: asStr(payment.id),
    paymentStatus: asStr(payment.status),
    paymentUrl: asStr(payment.payment_url) || undefined,
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
      body: JSON.stringify({
        amount: 10000,
        provider: "demo_payme",
        title: "Private chat",
        // send both keys — backend accepts either
        seller_user_id: input.lawyer_user_id,
        ...input,
      }),
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
  description: string;
  price: number;
  visibility: string;
  isActive: boolean;
  questionnaire: { name: string; label: string; required?: boolean }[];
};

function normTemplate(v: unknown): BackendTemplate {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: asStr(d.title ?? d.name),
    slug: asStr(d.slug),
    category: asStr(d.category),
    language: asStr(d.language),
    description: asStr(d.description),
    price: asNum(d.price),
    visibility: asStr(d.visibility, "client"),
    isActive: d.is_active !== false,
    questionnaire: asArr(d.fields ?? d.questionnaire).map((q) => {
      const x = asDict(q);
      return { name: asStr(x.name), label: asStr(x.label ?? x.name), required: Boolean(x.required) };
    }),
  };
}

export async function getDocumentTemplates(): Promise<BackendTemplate[]> {
  return listFrom(await http("/document-templates"), "templates", "items", "data").map(normTemplate);
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
  amount: number,
): Promise<DocumentRequest> {
  return normDocRequest(
    await http(`/document-requests/${requestId}/payments`, {
      method: "POST",
      body: JSON.stringify({ provider, amount }),
    }),
  );
}
export async function getDocumentRequest(requestId: string): Promise<DocumentRequest> {
  return normDocRequest(await http(`/document-requests/${requestId}`));
}

// ── Organizations (advocate orgs) ─────────────────────────────────
export type Organization = {
  id: string;
  name: string;
  organizationType: string;
  phone: string;
  inn: string;
  region: string;
  address: string;
  verificationStatus: string;
  ownerUserId: string;
};
function normOrg(v: unknown): Organization {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: asStr(d.name),
    organizationType: asStr(d.organization_type),
    phone: asStr(d.phone),
    inn: asStr(d.inn),
    region: asStr(d.region),
    address: asStr(d.address),
    verificationStatus: asStr(d.verification_status),
    ownerUserId: asStr(d.owner_user_id),
  };
}
export type OrgMember = { id: string; userId: string; title: string; status: string };
function normMember(v: unknown): OrgMember {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    userId: asStr(d.user_id),
    title: asStr(d.title),
    status: asStr(d.status),
  };
}
export async function listOrganizations(): Promise<Organization[]> {
  return listFrom(await http("/organizations"), "organizations", "items", "data").map(normOrg);
}
export async function createOrganization(input: {
  name: string;
  organization_type?: string;
  phone?: string;
  inn?: string;
  region?: string;
  address?: string;
}): Promise<Organization> {
  return normOrg(await http("/organizations", { method: "POST", body: JSON.stringify(input) }));
}
export async function listOrgMembers(orgId: string): Promise<OrgMember[]> {
  return listFrom(await http(`/organizations/${orgId}/members`), "members", "items", "data").map(normMember);
}
export async function addOrgMember(
  orgId: string,
  input: { user_id: string; title?: string; role_id?: string },
): Promise<OrgMember> {
  return normMember(await http(`/organizations/${orgId}/members`, { method: "POST", body: JSON.stringify(input) }));
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
export type SecureRoom = {
  id: string;
  status: string;
  orderId?: string;
  caseId?: string;
  clientUserId?: string;
  sellerUserId?: string;
  createdAt: string;
};
function normRoom(v: unknown): SecureRoom {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    status: asStr(d.status),
    orderId: asStr(d.order_id) || undefined,
    caseId: asStr(d.case_id) || undefined,
    clientUserId: asStr(d.client_user_id) || undefined,
    sellerUserId: asStr(d.seller_user_id) || undefined,
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}
export async function listSecureChats(): Promise<SecureRoom[]> {
  return listFrom(await http("/secure-chats"), "rooms", "items", "data").map(normRoom);
}
export async function createSecureChat(input: Record<string, unknown>): Promise<SecureRoom> {
  return normRoom(await http("/secure-chats", { method: "POST", body: JSON.stringify(input) }));
}
// Set how long messages live before auto-deletion. 0 = never (off).
// The backend keeps a 30-day archive after deletion.
export async function setChatAutoDelete(roomId: string, autoDeleteHours: number): Promise<void> {
  await http(`/secure-chats/${roomId}/settings`, {
    method: "PATCH",
    body: JSON.stringify({ auto_delete_hours: autoDeleteHours }),
  });
}
// Delete (archive) a chat. Backend keeps it recoverable for ~1 month.
export async function deleteSecureChat(roomId: string): Promise<void> {
  await http(`/secure-chats/${roomId}`, { method: "DELETE" });
}
export async function getSecureMessages(roomId: string): Promise<SecureMessage[]> {
  return listFrom(await http(`/secure-chats/${roomId}/messages`), "messages", "items", "data").map(normSecureMsg);
}
export async function sendSecureMessage(roomId: string, content: string): Promise<SecureMessage> {
  return normSecureMsg(
    await http(`/secure-chats/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message_type: "text", content, meta: {} }),
    }),
  );
}
export function secureSocketUrl(roomId: string, token?: string | null): string {
  const q = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${backendOrigin("ws")}/ws/secure-chats/${roomId}${q}`;
}
// WebRTC signaling socket for a specific call session.
export function callSocketUrl(roomId: string, callId: string, token?: string | null): string {
  const q = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${backendOrigin("ws")}/ws/secure-chats/${roomId}/calls/${callId}${q}`;
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
export async function requestVerification(
  input: Record<string, unknown> = {},
): Promise<unknown> {
  // check_type is required by the backend (SellerVerificationCreate); default to
  // a manual review request when the caller doesn't specify one.
  return http("/lawyers/me/verifications", {
    method: "POST",
    body: JSON.stringify({ check_type: "manual", ...input }),
  });
}
export async function adminVerifyLawyer(lawyerUserId: string): Promise<unknown> {
  return http(`/admin/lawyers/${lawyerUserId}/verify`, { method: "POST" });
}
export async function adminMarkPaid(paymentId: string): Promise<unknown> {
  return http(`/admin/payments/${paymentId}/mark-paid`, { method: "POST" });
}

// ── Generic module records (academy, b2b, ads, case-documents, legal-aid,
//    seller-onboarding, refund/replacement) — all share one shape ──────
export type ModuleRecord = {
  id: string;
  module: string;
  recordType: string;
  title: string;
  status: string;
  price: number;
  currency: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
function normModule(v: unknown): ModuleRecord {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    module: asStr(d.module),
    recordType: asStr(d.record_type),
    title: asStr(d.title),
    status: asStr(d.status),
    price: asNum(d.price),
    currency: asStr(d.currency, "UZS"),
    payload: (d.payload as Record<string, unknown>) ?? {},
    createdAt: asStr(d.created_at ?? d.createdAt),
  };
}
export type ModuleInput = {
  title: string;
  record_type?: string;
  status?: string;
  price?: number;
  currency?: string;
  payload?: Record<string, unknown>;
};
function listModule(path: string): Promise<ModuleRecord[]> {
  return http(path).then((d) => listFrom(d, "items", "data").map(normModule));
}
function createModule(path: string, input: ModuleInput): Promise<ModuleRecord> {
  return http(path, {
    method: "POST",
    body: JSON.stringify({
      record_type: input.record_type ?? "",
      title: input.title,
      status: input.status ?? "active",
      price: input.price ?? 0,
      currency: input.currency ?? "UZS",
      payload: input.payload ?? {},
    }),
  }).then(normModule);
}

export const listCourses = () => listModule("/academy/courses");
export const listB2bProducts = () => listModule("/b2b/products");
export const listAds = () => listModule("/ads/products");
export const createAd = (i: ModuleInput) => createModule("/ads/products", i);
export const listCaseDocuments = () => listModule("/case-documents");
export const createCaseDocument = (i: ModuleInput) => createModule("/case-documents", i);
export const listLegalAid = () => listModule("/legal-aid/requests");
export const createLegalAidRequest = (i: ModuleInput) => createModule("/legal-aid/requests", i);
export const createSellerOnboarding = (i: ModuleInput) => createModule("/seller-onboarding", i);
export const createRefundRequest = (i: ModuleInput) => createModule("/refund-requests", i);
export const createReplacementRequest = (i: ModuleInput) => createModule("/replacement-requests", i);

// A seller's public service offering + an existing private-chat room, if any.
export async function getLawyerServices(lawyerUserId: string): Promise<{ id: string; name: string }[]> {
  const d = asDict(await http(`/lawyers/${lawyerUserId}/services`));
  return asArr(d.services).map((x) => {
    const s = asDict(x);
    return { id: asStr(s.id ?? s.service_id ?? x), name: asStr(s.title ?? s.name) };
  });
}
export async function getLawyerPrivateChat(lawyerUserId: string): Promise<SecureRoom | null> {
  try {
    const r = normRoom(await http(`/lawyers/${lawyerUserId}/private-chat`));
    return r.id ? r : null;
  } catch {
    return null;
  }
}

// ── Order actions (accept / decline) ──────────────────────────────
export async function acceptOrder(orderId: string): Promise<BackendOrder> {
  return normOrder(await http(`/orders/${orderId}/accept`, { method: "POST" }));
}
export async function declineOrder(orderId: string): Promise<{ id: string; status: string }> {
  const d = asDict(await http(`/orders/${orderId}/decline`, { method: "POST" }));
  return { id: asStr(d.id), status: asStr(d.status) };
}

// ── Document template download (authed blob → browser save) ────────
export async function downloadTemplateFile(templateId: string, filename: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/document-templates/${templateId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `template-${templateId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Seller stats & clients ────────────────────────────────────────
export type SellerStats = { workload: Dict; finance: Dict; performance: Dict };
export async function getLawyerStats(): Promise<SellerStats> {
  const d = asDict(await http("/lawyers/me/stats"));
  return { workload: asDict(d.workload), finance: asDict(d.finance), performance: asDict(d.performance) };
}

export type LawyerClient = {
  id: string;
  name: string;
  phone: string;
  casesCount: number;
  hasConflict: boolean;
  lastActiveAt?: string;
};
export async function getLawyerClients(): Promise<LawyerClient[]> {
  return listFrom(await http("/lawyers/me/clients"), "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id),
      name: asStr(d.name),
      phone: asStr(d.phone),
      casesCount: asNum(d.cases_count),
      hasConflict: Boolean(d.has_conflict),
      lastActiveAt: asStr(d.last_active_at) || undefined,
    };
  });
}

// ── Calendar events ───────────────────────────────────────────────
export type CalendarEvent = {
  id: string;
  type: string;
  title: string;
  caseId?: string;
  startsAt: string;
  endsAt?: string;
  location: string;
  status: string;
};
function normEvent(v: unknown): CalendarEvent {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    type: asStr(d.type),
    title: asStr(d.title),
    caseId: asStr(d.case_id) || undefined,
    startsAt: asStr(d.starts_at),
    endsAt: asStr(d.ends_at) || undefined,
    location: asStr(d.location),
    status: asStr(d.status),
  };
}
export async function listCalendarEvents(range?: { from?: string; to?: string }): Promise<CalendarEvent[]> {
  const q = new URLSearchParams();
  if (range?.from) q.set("from", range.from);
  if (range?.to) q.set("to", range.to);
  const qs = q.toString();
  return listFrom(await http(`/calendar-events${qs ? `?${qs}` : ""}`), "items", "data").map(normEvent);
}
export type CalendarEventInput = {
  type: string;
  title: string;
  case_id?: string;
  starts_at: string;
  ends_at?: string;
  location?: string;
};
export async function createCalendarEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  return normEvent(await http("/calendar-events", { method: "POST", body: JSON.stringify(input) }));
}
export async function deleteCalendarEvent(id: string): Promise<void> {
  await http(`/calendar-events/${id}`, { method: "DELETE" });
}

// ── Promotions ────────────────────────────────────────────────────
export type PromotionStatus = { active: boolean; packageId?: string; daysLeft: number; endsAt?: string };
export async function getPromotionStatus(): Promise<PromotionStatus> {
  const d = asDict(await http("/promotions/me"));
  return {
    active: Boolean(d.active),
    packageId: asStr(d.package_id) || undefined,
    daysLeft: asNum(d.days_left),
    endsAt: asStr(d.ends_at) || undefined,
  };
}
export type PromotionAnalytics = {
  impressions: number;
  searchAppearances: number;
  profileClicks: number;
  contactRequests: number;
  series: { date: string; impressions: number }[];
};
export async function getPromotionAnalytics(): Promise<PromotionAnalytics> {
  const d = asDict(await http("/promotions/analytics"));
  return {
    impressions: asNum(d.impressions),
    searchAppearances: asNum(d.search_appearances),
    profileClicks: asNum(d.profile_clicks),
    contactRequests: asNum(d.contact_requests),
    series: asArr(d.series).map((x) => {
      const s = asDict(x);
      return { date: asStr(s.date), impressions: asNum(s.impressions) };
    }),
  };
}
export async function checkoutPromotion(packageId: string, days: number): Promise<PurchaseResult> {
  return normPurchase(
    await http("/promotions/checkout", {
      method: "POST",
      body: JSON.stringify({ package_id: packageId, days, provider: "demo_payme" }),
    }),
  );
}

// ── Gifts ─────────────────────────────────────────────────────────
export type Gift = {
  id: string;
  direction: string;
  recipientPhone: string;
  planName: string;
  termMonths: number;
  status: string;
  createdAt: string;
};
function normGift(v: unknown): Gift {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    direction: asStr(d.direction, "sent"),
    recipientPhone: asStr(d.recipient_phone),
    planName: asStr(d.plan_name ?? d.service_name),
    termMonths: asNum(d.term_months),
    status: asStr(d.status),
    createdAt: asStr(d.created_at),
  };
}
export async function listGifts(): Promise<Gift[]> {
  return listFrom(await http("/gifts"), "items", "data").map(normGift);
}
// A gift is either a subscription plan or a single service.
export type GiftInput = {
  plan_id?: string;
  service_id?: string;
  recipient_phone: string;
  term_months?: number;
  message?: string;
};
export async function createGift(input: GiftInput): Promise<PurchaseResult> {
  return normPurchase(
    await http("/gifts", {
      method: "POST",
      body: JSON.stringify({ provider: "demo_payme", term_months: 6, ...input }),
    }),
  );
}

// ── Client profile, payment methods, family ───────────────────────
export type ClientProfile = {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  subscription?: { planName: string; status: string; renewsAt?: string };
};
function normClientProfile(v: unknown): ClientProfile {
  const d = asDict(v);
  const sub = asDict(d.subscription);
  const hasSub = Object.keys(sub).length > 0;
  return {
    name: asStr(d.name),
    phone: asStr(d.phone),
    email: asStr(d.email),
    avatarUrl: asStr(d.avatar_url),
    subscription: hasSub
      ? { planName: asStr(sub.plan_name), status: asStr(sub.status), renewsAt: asStr(sub.renews_at) || undefined }
      : undefined,
  };
}
export async function getClientProfile(): Promise<ClientProfile> {
  return normClientProfile(await http("/clients/me"));
}
export async function updateClientProfile(patch: {
  name?: string;
  email?: string;
  avatar_url?: string;
}): Promise<ClientProfile> {
  return normClientProfile(await http("/clients/me", { method: "PUT", body: JSON.stringify(patch) }));
}

export type PaymentMethod = { id: string; brand: string; last4: string; expires: string; isDefault: boolean };
function normMethod(v: unknown): PaymentMethod {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    brand: asStr(d.brand),
    last4: asStr(d.last4),
    expires: asStr(d.expires),
    isDefault: Boolean(d.is_default),
  };
}
export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  return listFrom(await http("/clients/me/payment-methods"), "items", "data").map(normMethod);
}
export async function addPaymentMethod(input: {
  brand?: string;
  last4: string;
  expires?: string;
  is_default?: boolean;
}): Promise<PaymentMethod> {
  return normMethod(await http("/clients/me/payment-methods", { method: "POST", body: JSON.stringify(input) }));
}
export async function deletePaymentMethod(id: string): Promise<void> {
  await http(`/clients/me/payment-methods/${id}`, { method: "DELETE" });
}

export type FamilyMember = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  // When true, this member may use the account owner's active plan benefits.
  sharedAccess: boolean;
};
function normFamily(v: unknown): FamilyMember {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: asStr(d.name),
    phone: asStr(d.phone),
    relation: asStr(d.relation),
    sharedAccess: Boolean(d.shared_access ?? d.can_use_plan),
  };
}
export async function listFamilyMembers(): Promise<FamilyMember[]> {
  return listFrom(await http("/clients/me/family-members"), "items", "data").map(normFamily);
}
export async function addFamilyMember(input: { name: string; phone: string; relation?: string }): Promise<FamilyMember> {
  return normFamily(await http("/clients/me/family-members", { method: "POST", body: JSON.stringify(input) }));
}
export async function deleteFamilyMember(id: string): Promise<void> {
  await http(`/clients/me/family-members/${id}`, { method: "DELETE" });
}
// Toggle whether a family member can use the owner's active plan.
export async function setFamilyMemberAccess(id: string, sharedAccess: boolean): Promise<void> {
  await http(`/clients/me/family-members/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ shared_access: sharedAccess }),
  });
}

// ── User activity log ─────────────────────────────────────────────
export type ActivityEntry = {
  id: string;
  action: string;
  detail: string;
  ip?: string;
  createdAt: string;
};
function normActivity(v: unknown): ActivityEntry {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    action: asStr(d.action ?? d.type ?? d.event),
    detail: asStr(d.detail ?? d.description ?? d.message),
    ip: asStr(d.ip ?? d.ip_address) || undefined,
    createdAt: asStr(d.created_at ?? d.createdAt ?? d.timestamp),
  };
}
export async function listMyActivity(): Promise<ActivityEntry[]> {
  return listFrom(await http("/users/me/activity"), "items", "data", "logs").map(normActivity);
}

// ── Payments history ──────────────────────────────────────────────
export type PaymentHistory = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  kind: string;
  description: string;
  orderId?: string;
  createdAt: string;
  receiptUrl?: string;
};
export async function listPayments(): Promise<PaymentHistory[]> {
  return listFrom(await http("/payments"), "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id),
      amount: asNum(d.amount),
      currency: asStr(d.currency, "UZS"),
      status: asStr(d.status),
      method: asStr(d.method),
      kind: asStr(d.kind),
      description: asStr(d.description),
      orderId: asStr(d.order_id) || undefined,
      createdAt: asStr(d.created_at),
      receiptUrl: asStr(d.receipt_url) || undefined,
    };
  });
}
export function paymentReceiptUrl(paymentId: string): string {
  return absUrl(`/payments/${paymentId}/receipt`);
}

// ── Notifications ─────────────────────────────────────────────────
export type Notification = { id: string; title: string; body: string; kind: string; read: boolean; createdAt: string };
export async function listNotifications(): Promise<Notification[]> {
  return listFrom(await http("/notifications"), "items", "data").map((v) => {
    const d = asDict(v);
    return {
      id: asStr(d.id),
      title: asStr(d.title),
      body: asStr(d.body),
      kind: asStr(d.kind),
      read: Boolean(d.read),
      createdAt: asStr(d.created_at),
    };
  });
}
export async function markNotificationRead(id: string): Promise<void> {
  await http(`/notifications/${id}/read`, { method: "POST" });
}
export async function markAllNotificationsRead(): Promise<void> {
  await http("/notifications/read-all", { method: "POST" });
}
export async function getUnreadCount(): Promise<number> {
  const d = asDict(await http("/notifications/unread-count"));
  return asNum(d.count);
}

// ── Cases: detail, update, status, seller's cases (CIMS) ──────────
export async function getCase(caseId: string): Promise<BackendCase> {
  return normCase(await http(`/cases/${caseId}`));
}
export type CaseUpdate = {
  lawyer_user_id?: string;
  case_type?: string;
  stage?: string;
  status?: string;
  title?: string;
  description?: string;
  next_action?: string;
  deadline_at?: string;
};
export async function updateCase(caseId: string, patch: CaseUpdate): Promise<BackendCase> {
  return normCase(await http(`/cases/${caseId}`, { method: "PATCH", body: JSON.stringify(patch) }));
}
export async function setCaseStatus(caseId: string, status: string, nextAction?: string): Promise<BackendCase> {
  const body: Record<string, unknown> = { status };
  if (nextAction !== undefined) body.next_action = nextAction;
  return normCase(await http(`/cases/${caseId}/status`, { method: "POST", body: JSON.stringify(body) }));
}
export async function getMyCases(): Promise<BackendCase[]> {
  return listFrom(await http("/lawyers/me/cases"), "cases", "items", "data").map(normCase);
}

// ── Secure-chat call sessions (audio/video) ───────────────────────
export type CallSession = {
  id: string;
  roomId: string;
  callerUserId: string;
  callType: string;
  title: string;
  status: string;
  joinUrl: string;
  startedAt: string;
  endedAt?: string;
};
function normCall(v: unknown): CallSession {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    roomId: asStr(d.room_id),
    callerUserId: asStr(d.caller_user_id),
    callType: asStr(d.call_type),
    title: asStr(d.title),
    status: asStr(d.status),
    joinUrl: backendUrl(asStr(d.join_url)),
    startedAt: asStr(d.started_at),
    endedAt: asStr(d.ended_at) || undefined,
  };
}
export async function startCall(roomId: string, callType: "audio" | "video", title: string): Promise<CallSession> {
  return normCall(
    await http(`/secure-chats/${roomId}/calls`, {
      method: "POST",
      body: JSON.stringify({ call_type: callType, title }),
    }),
  );
}
export async function listCalls(roomId: string): Promise<CallSession[]> {
  return listFrom(await http(`/secure-chats/${roomId}/calls`), "calls", "items", "data").map(normCall);
}
export async function endCall(callId: string): Promise<CallSession> {
  return normCall(await http(`/calls/${callId}`, { method: "PATCH", body: JSON.stringify({ status: "ended" }) }));
}

// ── Seller workspace (folders + file metadata) ────────────────────
export type WorkspaceFolder = { id: string; name: string; parentId?: string; caseId?: string; status: string; createdAt: string };
function normFolder(v: unknown): WorkspaceFolder {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    name: asStr(d.name),
    parentId: asStr(d.parent_id) || undefined,
    caseId: asStr(d.case_id) || undefined,
    status: asStr(d.status),
    createdAt: asStr(d.created_at),
  };
}
export async function listFolders(): Promise<WorkspaceFolder[]> {
  return listFrom(await http("/workspace/folders"), "folders", "items", "data").map(normFolder);
}
export async function createFolder(input: { name: string; parent_id?: string; case_id?: string }): Promise<WorkspaceFolder> {
  return normFolder(await http("/workspace/folders", { method: "POST", body: JSON.stringify(input) }));
}
export async function deleteFolder(id: string): Promise<void> {
  await http(`/workspace/folders/${id}`, { method: "DELETE" });
}

export type WorkspaceFile = {
  id: string;
  folderId?: string;
  caseId?: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
};
function normFile(v: unknown): WorkspaceFile {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    folderId: asStr(d.folder_id) || undefined,
    caseId: asStr(d.case_id) || undefined,
    fileName: asStr(d.file_name),
    fileUrl: asStr(d.file_url),
    mimeType: asStr(d.mime_type),
    size: asNum(d.size),
    createdAt: asStr(d.created_at),
  };
}
export async function listFiles(): Promise<WorkspaceFile[]> {
  return listFrom(await http("/workspace/files"), "files", "items", "data").map(normFile);
}
export async function createFile(input: {
  file_name: string;
  file_url?: string;
  folder_id?: string;
  case_id?: string;
  mime_type?: string;
  size?: number;
}): Promise<WorkspaceFile> {
  return normFile(await http("/workspace/files", { method: "POST", body: JSON.stringify(input) }));
}
export async function deleteFile(id: string): Promise<void> {
  await http(`/workspace/files/${id}`, { method: "DELETE" });
}

// ── Admin: seed demo data ─────────────────────────────────────────
export type DemoSeedResult = { templates: number; adsProducts: number; message: string };
export async function seedDemoData(): Promise<DemoSeedResult> {
  const d = asDict(await http("/admin/demo-data/seed", { method: "POST" }));
  return { templates: asNum(d.templates), adsProducts: asNum(d.ads_products), message: asStr(d.message) };
}

// ── Admin: seller registration requests (approval flow) ──────────
export type RegisterRequest = {
  id: string;
  verificationId: string;
  status: string;
  role: string;
  name: string;
  phone: string;
  createdAt: string;
};
function normRegReq(v: unknown): RegisterRequest {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    verificationId: asStr(d.verification_id),
    status: asStr(d.status),
    role: asStr(d.role),
    name: asStr(d.name),
    phone: asStr(d.phone),
    createdAt: asStr(d.created_at),
  };
}
export async function listRegisterRequests(status = "pending"): Promise<RegisterRequest[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return listFrom(await http(`/admin/register-requests${q}`), "requests", "items", "data").map(normRegReq);
}
export async function acceptRegisterRequest(id: string): Promise<unknown> {
  return http(`/admin/register-requests/${id}/accept`, { method: "POST" });
}
export async function rejectRegisterRequest(id: string): Promise<unknown> {
  return http(`/admin/register-requests/${id}/reject`, { method: "POST" });
}

// ── helpers ───────────────────────────────────────────────────────
function listFrom(data: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  const d = asDict(data);
  for (const k of keys) if (Array.isArray(d[k])) return d[k] as unknown[];
  return [];
}
