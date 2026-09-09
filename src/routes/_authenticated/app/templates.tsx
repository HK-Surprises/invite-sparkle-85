import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { TemplateCard } from "@/components/shared/TemplateCard";
import { InvitationPreview } from "@/components/shared/InvitationPreview";
import { EmptyState } from "@/components/shared/EmptyState";
import { CardGridSkeleton } from "@/components/shared/LoadingState";
import { myTemplatesQuery } from "@/lib/queries";
import { getTemplateEntry, sampleDataFor } from "@/templates/registry";

export const Route = createFileRoute("/_authenticated/app/templates")({
  head: () => ({ meta: [{ title: "Templates — InviteHub" }, { name: "description", content: "Choose a premium interactive invitation design assigned to your account." }, { property: "og:title", content: "Templates — InviteHub" }, { property: "og:description", content: "Choose a premium interactive invitation design assigned to your account." }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const templates = useQuery(myTemplatesQuery);
  const [preview, setPreview] = useState<{ name: string; componentKey: string } | null>(null);
  const sample = preview ? sampleDataFor(preview.componentKey) : null;

  return (
    <div>
      <PageHeader
        eyebrow="Step 1"
        title="Choose a design"
        description="Premium interactive invitations, made for the phone. Open a live preview to feel how your guests will experience it."
      />
      {templates.isLoading ? (
        <CardGridSkeleton />
      ) : templates.isError ? (
        <EmptyState title="We couldn't load your designs" description="Please refresh the page to try again." />
      ) : templates.data?.length ? (
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {templates.data.map((t) => {
            const entry = getTemplateEntry(t.component_key);
            return (
              <TemplateCard
                key={t.id}
                name={t.name}
                categoryName={t.categories?.name ?? entry?.category}
                componentKey={t.component_key}
                description={entry?.description ?? t.description}
                className="h-full"
                footer={
                  <>
                    <Button asChild className="flex-1">
                      <Link to="/app/invitation/new" search={{ template: t.id }}>
                        Select design
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreview({ name: t.name, componentKey: t.component_key })}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Live preview
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState icon={LayoutTemplate} title="No designs assigned" description="No designs are currently assigned to your account. Please contact support to get access." />
      )}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-2xl">{preview?.name}</DialogTitle>
          <p className="-mt-2 text-xs text-muted-foreground">
            A sample invitation. Your details and each guest's name appear automatically.
          </p>
          {preview && sample && (
            <InvitationPreview
              componentKey={preview.componentKey}
              title={sample.title}
              data={sample.data}
              guestName="Amit Shah"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
