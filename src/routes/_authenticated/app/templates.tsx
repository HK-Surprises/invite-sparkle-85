import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { TemplateCard } from "@/components/shared/TemplateCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CardGridSkeleton } from "@/components/shared/LoadingState";
import { myTemplatesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app/templates")({
  head: () => ({ meta: [{ title: "Templates — InviteHub" }, { name: "description", content: "Choose a template assigned to your account." }, { property: "og:title", content: "Templates — InviteHub" }, { property: "og:description", content: "Choose a template assigned to your account." }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const templates = useQuery(myTemplatesQuery);
  return (
    <div>
      <PageHeader eyebrow="Step 1" title="Choose a template" description="These designs have been assigned to your account. Select one to enter your invitation details." />
      {templates.isLoading ? (
        <CardGridSkeleton />
      ) : templates.isError ? (
        <EmptyState title="We couldn't load your templates" description="Please refresh the page to try again." />
      ) : templates.data?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {templates.data.map((t) => (
            <TemplateCard
              key={t.id}
              name={t.name}
              categoryName={t.categories?.name}
              componentKey={t.component_key}
              description={t.description}
              footer={
                <Button asChild className="w-full">
                  <Link to="/app/invitation/new" search={{ template: t.id }}>
                    Select Template
                  </Link>
                </Button>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={LayoutTemplate} title="No templates assigned" description="No templates are currently assigned to your account. Please contact support to get access." />
      )}
    </div>
  );
}
