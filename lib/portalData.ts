// Mock data for the authenticated portal (real data will come from the API).
// Status/stage/payment are KEYS resolved through the `portal` messages; only
// sample record values (names, free-text descriptions, dates) are literal.

export type CaseStatus =
  | "active"
  | "new"
  | "investigation"
  | "court"
  | "appeal"
  | "completed"
  | "archived";
export type PaymentState = "paid" | "partial" | "unpaid";

export type LawyerCase = {
  id: string;
  client: string;
  title: string;
  areaKey: string; // enums.areas
  status: CaseStatus;
  stageKey: string; // enums.stages
  deadline: string;
  nextAction: string;
  value: string;
  payment: PaymentState;
};

export const LAWYER_KPIS = {
  urgent: 2,
  courts: 3,
  deadlines: 4,
  messages: 5,
  toReview: 3,
  incomeToday: "1,2 mln",
  incomeMonth: "18,4 mln",
  pending: "6,0 mln",
  viaLexgo: "11,2 mln",
};

export const LAWYER_CASES: LawyerCase[] = [
  { id: "LX-10245", client: "Abdullaev B.", title: "Shartnoma bo'yicha mablag' o'zlashtirilganlikda ayblov", areaKey: "criminal", status: "investigation", stageKey: "investigation", deadline: "2026-09-02", nextAction: "So'roqqa tayyorgarlik", value: "4 200 000", payment: "partial" },
  { id: "LX-10231", client: "Karimova D.", title: "Ajrashish va farzand ustidan vasiylik", areaKey: "family", status: "court", stageKey: "firstInstance", deadline: "2026-09-05", nextAction: "Sud majlisi", value: "1 900 000", payment: "paid" },
  { id: "LX-10218", client: "OOO 'Buxoro Savdo'", title: "Yetkazib beruvchi bilan xo'jalik nizosi", areaKey: "economic", status: "active", stageKey: "unknown", deadline: "2026-09-10", nextAction: "Pretenziya xati", value: "5 400 000", payment: "unpaid" },
  { id: "LX-10202", client: "Toshmatov S.", title: "Ishdan noqonuniy bo'shatish", areaKey: "labor", status: "appeal", stageKey: "appeal", deadline: "2026-09-14", nextAction: "Apellyatsiya shikoyati", value: "1 350 000", payment: "paid" },
  { id: "LX-10188", client: "Rahimova N.", title: "Meros bo'yicha da'vo", areaKey: "civil", status: "completed", stageKey: "firstInstance", deadline: "2026-08-20", nextAction: "—", value: "2 300 000", payment: "paid" },
];

export const MARKETPLACE: LawyerCase[] = [
  { id: "LX-10312", client: "Yashirin (to'lovgacha)", title: "Tergovga chaqirildi, jinoiy ish qo'zg'atilgan", areaKey: "criminal", status: "new", stageKey: "investigation", deadline: "2026-08-28", nextAction: "1 konsultatsiya, 1 sud majlisi", value: "3 500 000", payment: "unpaid" },
  { id: "LX-10309", client: "Yashirin (to'lovgacha)", title: "Ijara shartnomasi bo'yicha nizo", areaKey: "economic", status: "new", stageKey: "unknown", deadline: "2026-08-29", nextAction: "Hujjat tahlili, pretenziya", value: "2 200 000", payment: "unpaid" },
  { id: "LX-10305", client: "Yashirin (to'lovgacha)", title: "YTH bo'yicha ma'muriy protokol", areaKey: "administrative", status: "new", stageKey: "unknown", deadline: "2026-08-27", nextAction: "E'tiroz, sudda vakillik", value: "900 000", payment: "unpaid" },
];

export type CalendarEvent = {
  date: string;
  time: string;
  typeKey: "hearing" | "investigative" | "meeting" | "deadline";
  title: string;
  caseId: string;
};

export const CALENDAR: CalendarEvent[] = [
  { date: "2026-08-27", time: "10:00", typeKey: "hearing", title: "Birinchi instansiya sud majlisi", caseId: "LX-10231" },
  { date: "2026-08-28", time: "14:30", typeKey: "investigative", title: "So'roqda ishtirok", caseId: "LX-10245" },
  { date: "2026-08-29", time: "11:00", typeKey: "meeting", title: "Mijoz bilan uchrashuv", caseId: "LX-10218" },
  { date: "2026-09-02", time: "18:00", typeKey: "deadline", title: "Apellyatsiya muddati tugaydi", caseId: "LX-10202" },
];

export type ClientRecord = {
  name: string;
  phone: string;
  email: string;
  cases: number;
  conflict: boolean;
};

export const CLIENTS: ClientRecord[] = [
  { name: "Abdullaev Bekzod", phone: "+998 90 123 45 67", email: "b.abdullaev@mail.uz", cases: 2, conflict: false },
  { name: "Karimova Dilnoza", phone: "+998 91 234 56 78", email: "d.karimova@mail.uz", cases: 1, conflict: false },
  { name: "Toshmatov Sardor", phone: "+998 93 345 67 89", email: "s.toshmatov@mail.uz", cases: 1, conflict: true },
];

// ── Client role ──
export type ClientOrder = {
  id: string;
  service: string;
  lawyer: string;
  status: CaseStatus;
  date: string;
  price: string;
  payment: PaymentState;
};

export const CLIENT_ORDERS: ClientOrder[] = [
  { id: "OR-4821", service: "Ekspress konsultatsiya", lawyer: "Sardor Abdullayev", status: "completed", date: "2026-08-18", price: "90 000", payment: "paid" },
  { id: "OR-4830", service: "Ijara shartnomasi (AI)", lawyer: "LexGo.AI", status: "active", date: "2026-08-24", price: "110 000", payment: "paid" },
  { id: "OR-4841", service: "Da'vo arizasi", lawyer: "Rustam Qodirov", status: "new", date: "2026-08-25", price: "180 000", payment: "unpaid" },
];

export type Payment = {
  id: string;
  what: string;
  date: string;
  amount: string;
  state: PaymentState;
};

export const PAYMENTS: Payment[] = [
  { id: "PM-9021", what: "Ekspress konsultatsiya", date: "2026-08-18", amount: "90 000", state: "paid" },
  { id: "PM-9033", what: "Ijara shartnomasi (AI)", date: "2026-08-24", amount: "110 000", state: "paid" },
  { id: "PM-9040", what: "Standart obuna · 6 oy", date: "2026-08-20", amount: "249 000", state: "paid" },
  { id: "PM-9051", what: "Da'vo arizasi", date: "2026-08-25", amount: "180 000", state: "unpaid" },
];

export type Gift = {
  id: string;
  recipient: string;
  term: string;
  status: "sent" | "activated" | "pending";
  date: string;
};

export const GIFTS: Gift[] = [
  { id: "GF-201", recipient: "Ota-ona", term: "12", status: "activated", date: "2026-07-30" },
  { id: "GF-207", recipient: "Aka", term: "6", status: "sent", date: "2026-08-22" },
];
