import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CardGridSkeleton } from "@/components/shared/LoadingState";
import { customerCategoriesQuery, myTemplatesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app/templates/")({
  head: () => ({ meta: [{ title: "Invitation Categories — InviteHub" }, { name: "description", content: "Choose what you are celebrating, then explore premium interactive invitation designs." }, { property: "og:title", content: "Invitation Categories — InviteHub" }, { property: "og:description", content: "Choose what you are celebrating, then explore premium interactive invitation designs." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const templates = useQuery(myTemplatesQuery);
  const categories = useQuery(customerCategoriesQuery);
  const countByCategory = new Map<string, number>();
  for (const template of templates.data ?? []) {
    countByCategory.set(template.category_id, (countByCategory.get(template.category_id) ?? 0) + 1);
  }
  const isLoading = templates.isLoading || categories.isLoading;
  const isError = templates.isError || categories.isError;

  return (
    <div>
      <PageHeader
        eyebrow="Step 1"
        title="What are you celebrating?"
        description="Choose a category to explore a curated collection of premium invitations made for the moment."
      />
      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <EmptyState title="We couldn't load your categories" description="Please refresh the page to try again." />
      ) : categories.data?.length ? (
        <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-3">
          {categories.data.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              description={category.description}
              templateCount={countByCategory.get(category.id) ?? 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={LayoutTemplate} title="No categories available" description="New celebration categories will appear here when they are available." />
      )}
    </div>
  );
}
