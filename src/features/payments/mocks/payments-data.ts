export type PaymentStatus = "awaiting" | "needsReview" | "paid" | "refund";

export const paymentMetrics = [
  {
    key: "awaitingConfirmation",
    value: 3,
    noteKey: "awaitingAmount",
    tone: "blue",
  },
  {
    key: "reconciliationNeeded",
    value: 2,
    noteKey: "reconciliationNote",
    tone: "amber",
  },
  { key: "refundRequests", value: 1, noteKey: "refundAmount", tone: "red" },
  {
    key: "activatedThisWeek",
    value: 4,
    noteKey: "activatedAmount",
    tone: "green",
  },
] as const;

export const paymentRows = [
  {
    id: "SO-2026-0182",
    initials: "NM",
    name: "Nang Mya Su Aung",
    serviceKey: "applicationCheck",
    amount: 855000,
    methodKey: "bank",
    receivedKey: "fourteenMinutes",
    status: "needsReview",
    payer: "Mya Aung",
  },
  {
    id: "SO-2026-0181",
    initials: "HN",
    name: "Htet Naing",
    serviceKey: "documentReview",
    amount: 150000,
    methodKey: "kpay",
    receivedKey: "fortyTwoMinutes",
    status: "awaiting",
    payer: "Htet Naing",
  },
  {
    id: "SO-2026-0179",
    initials: "SS",
    name: "Su Su Lwin",
    serviceKey: "translation",
    amount: 90000,
    methodKey: "bank",
    receivedKey: "oneHourTwenty",
    status: "awaiting",
    payer: "Su Su Lwin",
  },
  {
    id: "SO-2026-0174",
    initials: "AT",
    name: "Aye Thandar",
    serviceKey: "visaChecklist",
    amount: 130000,
    methodKey: "card",
    receivedKey: "yesterday",
    status: "refund",
    payer: "Aye Thandar",
  },
  {
    id: "SO-2026-0172",
    initials: "KT",
    name: "Ko Tay Za",
    serviceKey: "documentReview",
    amount: 150000,
    methodKey: "cash",
    receivedKey: "yesterday",
    status: "paid",
    payer: "Ko Tay Za",
  },
  {
    id: "SO-2026-0168",
    initials: "TN",
    name: "Thet Naing Oo",
    serviceKey: "applicationCheck",
    amount: 855000,
    methodKey: "bank",
    receivedKey: "augFourteen",
    status: "paid",
    payer: "Thet Naing Oo",
  },
] as const satisfies readonly {
  id: string;
  initials: string;
  name: string;
  serviceKey: string;
  amount: number;
  methodKey: string;
  receivedKey: string;
  status: PaymentStatus;
  payer: string;
}[];
