export const milestoneTypes = [
  {
    key: "bankStatement",
    criteria: 4,
    status: "ready",
    detailKey: "bankDetail",
  },
  {
    key: "universityApplication",
    criteria: 3,
    status: "review",
    detailKey: "universityDetail",
  },
  {
    key: "passportBioPage",
    criteria: 4,
    status: "ready",
    detailKey: "passportDetail",
  },
  {
    key: "topikCertificate",
    criteria: 4,
    status: "ready",
    detailKey: "topikDetail",
  },
  {
    key: "visaDocumentSet",
    criteria: 0,
    status: "locked",
    detailKey: "visaDetail",
  },
  {
    key: "tbTestAppointment",
    criteria: 0,
    status: "locked",
    detailKey: "tbDetail",
  },
] as const;

export const canonicalCriteria = [
  "holder",
  "balance",
  "recent",
  "sharp",
] as const;

export const renderSurfaces = [
  {
    key: "studentPrompt",
    detailKey: "studentPromptDetail",
    completion: "4 of 4",
  },
  { key: "uploadCheck", detailKey: "uploadCheckDetail", completion: "4 of 4" },
  {
    key: "reviewerGate",
    detailKey: "reviewerGateDetail",
    completion: "4 of 4",
  },
  {
    key: "rejectionList",
    detailKey: "rejectionListDetail",
    completion: "0 → 4",
  },
] as const;

export const operatingRules = [
  { key: "queueOrder", code: "OS · 02", detailKey: "queueOrderDetail" },
  { key: "escalation", code: "OS · 08", detailKey: "escalationDetail" },
  { key: "cascading", code: "§7", detailKey: "cascadingDetail" },
  { key: "logSentence", code: "§8", detailKey: "logSentenceDetail" },
] as const;
