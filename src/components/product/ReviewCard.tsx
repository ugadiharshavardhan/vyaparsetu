import { Rating } from "@/components/common/Rating";
import { ThumbsUp } from "lucide-react";

export type ReviewData = {
  id: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
  helpful?: number;
  verified?: boolean;
};

export function ReviewCard({ review }: { review: ReviewData }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
            {review.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{review.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {review.verified ? "Verified buyer" : "Buyer"} · {review.date ?? "Last month"}
            </p>
          </div>
        </div>
        <Rating value={review.rating} />
      </header>
      <p className="mt-3 text-sm text-foreground leading-relaxed">"{review.text}"</p>
      {review.helpful !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
          <ThumbsUp className="h-3 w-3" /> {review.helpful} found this helpful
        </div>
      )}
    </article>
  );
}
