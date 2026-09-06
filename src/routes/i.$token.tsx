import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { resolveInvitation } from "@/lib/invitation.functions";
import { getTemplateComponent } from "@/templates/registry";

export const Route = createFileRoute("/i/$token")({
  loader: ({ params }) => resolveInvitation({ data: { token: params.token } }),
  head: ({ loaderData }) => {
    const ok = loaderData?.state === "ok" ? loaderData : null;
    const title = ok ? `${ok.invitation.title} — an invitation for ${ok.guest.name}` : "Invitation — InviteHub";
    const description = ok
      ? `Dear ${ok.guest.name}, you are warmly invited to ${ok.invitation.title}.`
      : "A personalized digital invitation.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: PublicInvitation,
  errorComponent: InvitationError,
  pendingComponent: InvitationPending,
});

function PublicInvitation() {
  const result = Route.useLoaderData();

  if (result.state !== "ok") {
    const copy = {
      not_found: { title: "We couldn't find this invitation.", text: "Please check the link you received, or ask the host to share it again." },
      inactive: { title: "This invitation is no longer active.", text: "Please contact the host if you believe this is a mistake." },
      not_started: { title: "This invitation isn't live yet.", text: "Please check back soon — the host will open it shortly." },
      expired: { title: "This invitation is no longer active.", text: "The celebration has passed or the invitation period has ended." },
    }[result.state];
    return <QuietPage title={copy.title} text={copy.text} />;
  }

  const Template = getTemplateComponent(result.template.component_key);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col shadow-float sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[2rem]">
        <Template
          title={result.invitation.title}
          data={result.invitation.data}
          guestName={result.guest.name}
          peopleCount={result.guest.people_count}
        />
      </div>
      <p className="pb-6 text-center text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
        Made with InviteHub
      </p>
    </div>
  );
}

function QuietPage({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-glow px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender text-lavender-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function InvitationError() {
  return <QuietPage title="We couldn't load your invitation." text="Please try again in a moment." />;
}

function InvitationPending() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-glow">
      <div className="h-[70vh] w-full max-w-md animate-pulse rounded-[2rem] bg-muted" />
    </div>
  );
}
