"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { AppHeader } from "@/common/components/AppHeader";
import { AppSidebar } from "@/common/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { PaymentDetails } from "@/features/payments/components/PaymentDetails";
import { PaymentMetrics } from "@/features/payments/components/PaymentMetrics";
import { PaymentQueue } from "@/features/payments/components/PaymentQueue";
import { paymentRows } from "@/features/payments/mocks/payments-data";
import { useLocale } from "@/providers/locale-provider";

export function PaymentsView() {
  const { dictionary } = useLocale();
  const copy = dictionary.payments;
  const [selectedId, setSelectedId] = useState<string>(paymentRows[0].id);
  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader variant="payments" />
        <main
          id="main-content"
          className="mx-auto max-w-[96rem] px-4 pb-10 pt-7 md:px-7 md:pt-8 xl:px-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Text as="h1" variant="page-title">
                {copy.title}
              </Text>
              <Text className="mt-1" variant="description">
                {copy.description}
              </Text>
            </div>
            <Button variant="outline">
              <Download />
              {copy.exportReport}
            </Button>
          </div>
          <div className="mt-6">
            <PaymentMetrics copy={copy} />
          </div>
          <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(22rem,0.9fr)]">
            <PaymentQueue
              copy={copy}
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
            <PaymentDetails copy={copy} selectedId={selectedId} />
          </div>
        </main>
      </div>
    </div>
  );
}
