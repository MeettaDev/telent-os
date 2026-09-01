import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import type { Dictionary } from "@/common/i18n/dictionaries";

export function QuickActionsPanel({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section className="surface p-5">
      <Text as="h2" variant="card-title">
        {dictionary.dashboard.quickActions}
      </Text>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="outline" className="text-primary-hover">
          {dictionary.dashboard.inviteStudent}
        </Button>
        <Button variant="outline" className="text-primary-hover">
          {dictionary.dashboard.sendMessage}
        </Button>
      </div>
    </section>
  );
}
