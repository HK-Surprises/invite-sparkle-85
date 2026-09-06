import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerForm, emptyCustomer, type CustomerFormValues } from "@/features/customers/CustomerForm";
import { createCustomer } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/customers/new")({
  head: () => ({ meta: [{ title: "New customer — InviteHub Admin" }, { name: "description", content: "Create a customer account with limits and template access." }, { property: "og:title", content: "New customer — InviteHub Admin" }, { property: "og:description", content: "Create a customer account." }] }),
  component: NewCustomerPage,
});

function NewCustomerPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createCustomer);
  const mutation = useMutation({
    mutationFn: (values: CustomerFormValues) => create({ data: values }),
    onSuccess: (res) => {
      toast.success("Customer created successfully.");
      qc.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/customers/$id", params: { id: res.id } });
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't create customer."),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="Add customer"
        description="Create the login, set the invitation limit, choose allowed templates and the access window."
        actions={
          <Button asChild variant="ghost">
            <Link to="/admin/customers">
              <ArrowLeft /> Back
            </Link>
          </Button>
        }
      />
      <CustomerForm initial={emptyCustomer} mode="create" onSubmit={(v) => mutation.mutate(v)} submitting={mutation.isPending} />
    </div>
  );
}
