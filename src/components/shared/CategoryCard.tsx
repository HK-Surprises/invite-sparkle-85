import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import weddingArtwork from "@/assets/categories/wedding.jpg";
import birthdayArtwork from "@/assets/categories/birthday.jpg";
import engagementArtwork from "@/assets/categories/engagement.jpg";
import anniversaryArtwork from "@/assets/categories/anniversary.jpg";
import housewarmingArtwork from "@/assets/categories/housewarming.jpg";
import religiousArtwork from "@/assets/categories/religious.jpg";
import otherArtwork from "@/assets/categories/other.jpg";

const categoryArtwork: Record<string, string> = {
  wedding: weddingArtwork,
  birthday: birthdayArtwork,
  engagement: engagementArtwork,
  anniversary: anniversaryArtwork,
  housewarming: housewarmingArtwork,
  religious: religiousArtwork,
  other: otherArtwork,
};

export function CategoryCard({
  name,
  slug,
  description,
  templateCount,
}: {
  name: string;
  slug: string;
  description?: string | null | undefined;
  templateCount: number;
}) {
  const artwork = categoryArtwork[slug] ?? otherArtwork;
  const countLabel = `${templateCount} ${templateCount === 1 ? "Template" : "Templates"}`;

  return (
    <Link
      to="/app/templates/$categorySlug"
      params={{ categorySlug: slug }}
      className="group relative isolate min-h-[22rem] overflow-hidden rounded-2xl bg-card shadow-soft outline-none transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-float focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[25rem]"
      aria-label={`Explore ${name} invitations, ${countLabel}`}
    >
      <img
        src={artwork}
        alt={`${name} invitation category artwork`}
        width={900}
        height={1100}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">{countLabel}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/40 bg-background/15 backdrop-blur transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <h2 className="font-display text-3xl font-semibold leading-none sm:text-4xl">{name}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-primary-foreground/85">
          {description || `Thoughtfully designed invitations for your ${name.toLowerCase()} celebration.`}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
          Explore collection <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}