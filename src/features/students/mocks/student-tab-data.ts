export const planEvents = [
  {
    date: "Aug 12",
    title: "consultationLogged",
    meta: "consultationLoggedMeta",
    actor: "May Zin",
    status: "logged",
  },
  {
    date: "Aug 14",
    title: "planDrafted",
    meta: "planDraftedMeta",
    actor: "May Zin",
    status: "provisional",
  },
  {
    date: "Aug 15",
    title: "eligibilityRequested",
    meta: "eligibilityRequestedMeta",
    actor: "May Zin → Ko Htet",
    status: "reviewerStatus",
  },
  {
    date: "Aug 15",
    title: "eligibilityApproved",
    meta: "eligibilityApprovedMeta",
    actor: "Ko Htet",
    status: "approved",
  },
  {
    date: "Aug 16",
    title: "planPublished",
    meta: "planPublishedMeta",
    actor: "May Zin",
    status: "publishedStatus",
  },
] as const;

export const processMilestones = [
  {
    title: "bankStatement",
    meta: "bankStatementMeta",
    status: "underReview",
    owner: "Ko Htet",
    due: "todayAtFour",
  },
  {
    title: "passportBio",
    meta: "passportBioMeta",
    status: "approved",
    owner: "—",
    due: "Aug 10",
  },
  {
    title: "topikCertificate",
    meta: "topikMeta",
    status: "approved",
    owner: "—",
    due: "Aug 08",
  },
  {
    title: "universityApplication",
    meta: "universityApplicationMeta",
    status: "ready",
    owner: "notClaimed",
    due: "Sep 05",
  },
  {
    title: "visaDocumentSet",
    meta: "visaDocumentMeta",
    status: "lockedStatus",
    owner: "—",
    due: "afterAdmission",
  },
] as const;

export const activityEvents = [
  {
    date: "14 min ago",
    title: "documentResubmitted",
    meta: "documentResubmittedMeta",
    actor: "studentActor",
  },
  {
    date: "Aug 16 · 09:20",
    title: "documentRejected",
    meta: "documentRejectedMeta",
    actor: "reviewerActor",
  },
  {
    date: "Aug 16 · 08:05",
    title: "planSent",
    meta: "planSentMeta",
    actor: "counselorActor",
  },
  {
    date: "Aug 15 · 16:40",
    title: "approvalEvent",
    meta: "approvalEventMeta",
    actor: "reviewerActor",
  },
  {
    date: "Aug 15 · 11:02",
    title: "deadlineRecomputed",
    meta: "deadlineRecomputedMeta",
    actor: "systemActor",
  },
] as const;

export const studentFiles = [
  {
    name: "bank_statement_v2.jpg",
    meta: "2.4 MB · 14 min ago",
    status: "current",
  },
  {
    name: "bank_statement_v1.jpg",
    meta: "2.1 MB · Aug 15",
    status: "superseded",
  },
  { name: "passport_bio.jpg", meta: "1.8 MB · Aug 10", status: null },
  { name: "topik_certificate.pdf", meta: "0.9 MB · Aug 08", status: null },
] as const;
