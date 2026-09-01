"use client";

import { LoaderCircle } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";

type ConfirmDialogProps = {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  isPending?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pendingLabel?: string;
  title: string;
};

export function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  description,
  isPending = false,
  onConfirm,
  onOpenChange,
  open,
  pendingLabel,
  title,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen);
      }}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl outline-none"
          onEscapeKeyDown={(event) => {
            if (isPending) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (isPending) event.preventDefault();
          }}
        >
          <Dialog.Title asChild>
            <Text as="h2" variant="section-title">
              {title}
            </Text>
          </Dialog.Title>
          <Dialog.Description asChild>
            <Text className="mt-2" variant="description">
              {description}
            </Text>
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {cancelLabel}
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isPending}
              onClick={onConfirm}
              type="button"
            >
              {isPending && (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              )}
              {isPending ? (pendingLabel ?? confirmLabel) : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
