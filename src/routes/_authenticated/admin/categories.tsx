import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { adminTemplatesQuery, categoriesQuery } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import type { Category } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — InviteHub Admin" }, { name: "description", content: "Manage template categories." }, { property: "og:title", content: "Categories — InviteHub Admin" }, { property: "og:description", content: "Manage template categories." }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const categories = useQuery(categoriesQuery);
  const templates = useQuery(adminTemplatesQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const add = useMutation({
    mutationFn: async () => {
      const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { error } = await supabase.from("categories").insert({ name: form.name.trim(), slug, description: form.description || null, sort_order: (categories.data?.length ?? 0) + 1 });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { toast.success("Category created."); setOpen(false); setForm({ name: "", description: "" }); qc.invalidateQueries({ queryKey: ["categories"] }); },
    onError: () => toast.error("Couldn't create category."),
  });
  const toggle = useMutation({
    mutationFn: async (c: Category) => { const { error } = await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id); if (error) throw new Error(error.message); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const count = (id: string) => templates.data?.filter((t) => t.category_id === id).length ?? 0;
  const active = categories.data?.filter((c) => c.is_active).length ?? 0;

  return (
    <div>
      <PageHeader title="Categories" description="Categories are data-driven — add or deactivate them without code changes." actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus /> Add Category</Button></DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogTitle className="font-display text-2xl">New category</DialogTitle>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
              <div className="space-y-2"><Label htmlFor="cat-name">Name</Label><Input id="cat-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="cat-desc">Description</Label><Input id="cat-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={add.isPending}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total categories" value={categories.data?.length} tone="lavender" />
        <StatsCard label="Active" value={active} tone="sage" />
        <StatsCard label="Inactive" value={(categories.data?.length ?? 0) - active} tone="rose" />
        <StatsCard label="Total templates" value={templates.data?.length} tone="peach" />
      </div>
      <section className="card-elevated overflow-hidden">
        {categories.isLoading ? <TableSkeleton /> : (
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-center">Templates</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.data?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.description ?? "—"}</TableCell>
                  <TableCell className="text-center">{count(c.id)}</TableCell>
                  <TableCell><StatusBadge status={c.is_active ? "active" : "inactive"} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => toggle.mutate(c)}>{c.is_active ? "Deactivate" : "Activate"}</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
