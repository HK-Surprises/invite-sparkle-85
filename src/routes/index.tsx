import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Link2, Sparkles, UserRound, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/shared/AppShell";
import { InvitationPreview } from "@/components/shared/InvitationPreview";
import { sampleDataFor } from "@/templates/registry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InviteHub — Personalized digital invitations for every guest" },
      { name: "description", content: "One invitation design, a unique personalized invitation link for every guest. Built for Indian weddings and celebrations." },
      { property: "og:title", content: "InviteHub — Personalized digital invitations" },
      { property: "og:description", content: "Every guest receives a unique, personalized invitation. One design, hundreds of personal links." },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Sparkles, title: "Choose a template", text: "Pick from elegant designs curated for weddings and celebrations." },
  { icon: UserRound, title: "Add your guests", text: "Enter names one by one. No spreadsheets, no technical setup." },
  { icon: Link2, title: "Get unique links", text: "Every guest receives their own private link, with their name on the card." },
  { icon: Eye, title: "See who opened", text: "Know exactly which guests have viewed their invitation." },
];

function Landing() {
  const sample = sampleDataFor("wedding_traditional_01");
  return (
    <div className="min-h-screen bg-hero-glow">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BrandMark />
        <Button asChild variant="outline">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-10 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Digital invitations, made personal</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            One design.
            <br />
            <span className="text-gradient-brand">A unique invitation</span>
            <br />
            for every guest.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Stop forwarding the same PDF to 200 people. InviteHub turns one beautiful design into hundreds of
            personal invitations — each one opening with the guest's own name.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Open your dashboard <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="/i/a8Kx91PqLm" target="_blank" rel="noopener noreferrer">
                See a sample invitation
              </a>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-lavender-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative animate-float">
          <InvitationPreview componentKey="wedding_traditional_01" title={sample.title} data={sample.data} guestName="Amit" className="max-w-[340px]" />
          <div className="card-elevated absolute -bottom-4 left-1/2 w-64 -translate-x-1/2 px-4 py-3 text-center text-sm shadow-card">
            <span className="text-muted-foreground">Amit sees </span>
            <span className="font-display text-base italic">“Dear Amit”</span>
            <span className="text-muted-foreground"> — Neha sees </span>
            <span className="font-display text-base italic">“Dear Neha”</span>
          </div>
        </div>
      </section>
    </div>
  );
}
