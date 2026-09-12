import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Eye, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { InvitationPreview } from "@/components/shared/InvitationPreview";
import { CardGridSkeleton } from "@/components/shared/LoadingState";
import { TemplateCard } from "@/components/shared/TemplateCard";
import { customerCategoriesQuery, myTemplatesQuery } from "@/lib/queries";
import { getTemplateEntry, sampleDataFor } from "@/templates/registry";

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/_authenticated/app/templates/$categorySlug")({
  head: ({ params }) => {
    const categoryName = titleCaseSlug(params.categorySlug);
    const title = `${categoryName} Invitations — InviteHub`;
    const description = `Explore premium ${categoryName.toLowerCase()} invitation designs and choose the perfect one for your celebration.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: CategoryTemplatesPage,
});

function CategoryTemplatesPage() {
  const { categorySlug } = Route.useParams();
  const categories = useQuery(customerCategoriesQuery);
  const templates = useQuery(myTemplatesQuery);
  const [preview, setPreview] = useState<{ name: string; componentKey: string } | null>(null);
  const category = categories.data?.find((item) => item.slug === categorySlug);
  const categoryTemplates = templates.data?.filter((template) => template.categories?.slug === categorySlug) ?? [];
  const sample = preview ? sampleDataFor(preview.componentKey) : null;
  const isLoading = categories.isLoading || templates.isLoading;
  const isError = categories.isError || templates.isError;
  const countLabel = `${categoryTemplates.length} ${categoryTemplates.length === 1 ? "Template" : "Templates"}`;

  if (isLoading) return <CardGridSkeleton />;

  if (isError) {
    return <EmptyState title="We couldn't load this collection" description="Please refresh the page to try again." />;
  }

  if (!category) {
    return (
      <EmptyState
        icon={LayoutTemplate}
        title="Collection not found"
        description="This category is unavailable or has been removed."
        action={
          <Button asChild>
            <Link to="/app/templates">Back to Categories</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/app/templates" className="transition-colors hover:text-foreground">Templates</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Curated collection</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{category.name} Invitations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {category.description || `Thoughtfully designed invitations for your ${category.name.toLowerCase()} celebration.`}
          </p>
          <p className="mt-3 text-sm font-semibold text-primary">{countLabel}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/app/templates"><ArrowLeft /> Back to Categories</Link>
        </Button>
      </div>

      {categoryTemplates.length ? (
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {categoryTemplates.map((template) => {
            const entry = getTemplateEntry(template.component_key);
            return (
              <TemplateCard
                key={template.id}
                name={template.name}
                categoryName={category.name}
                componentKey={template.component_key}
                description={entry?.description ?? template.description}
                className="h-full"
                footer={
                  <>
                    <Button asChild className="flex-1">
                      <Link
                        to="/app/invitation/new"
                        search={{ template: template.id, category: category.slug }}
                      >
                        Select Template
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreview({ name: template.name, componentKey: template.component_key })}
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={LayoutTemplate}
          title={`No ${category.name.toLowerCase()} designs available yet`}
          description="New designs will appear here as soon as they are assigned to your account."
          action={
            <Button asChild variant="outline">
              <Link to="/app/templates">Explore other categories</Link>
            </Button>
          }
        />
      )}

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
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