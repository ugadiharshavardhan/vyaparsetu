import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSupplierReviews } from "@/hooks/useSupplier";

export const Route = createFileRoute("/_authenticated/supplier/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Supplier" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { reviews, reply } = useSupplierReviews();
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);
  const five = reviews.filter((r) => r.rating === 5).length;
  const four = reviews.filter((r) => r.rating === 4).length;
  const under = reviews.filter((r) => r.rating <= 3).length;

  return (
    
      <div className="container-page space-y-6 py-8">
        <PageHeader title="Reviews" description="Every voice matters. Reply, monitor and improve." />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Average rating" value={avg.toFixed(1)} hint="All time" icon={Star} tone="brand" />
          <StatCard label="5 star reviews" value={String(five)} hint="Delighted" icon={Star} tone="success" delay={0.05} />
          <StatCard label="4 star reviews" value={String(four)} hint="Happy" icon={Star} tone="info" delay={0.1} />
          <StatCard label="Needs attention" value={String(under)} hint="≤ 3 stars" icon={Star} tone="warning" delay={0.15} />
        </div>

        <SectionCard title="Latest reviews">
          <ul className="space-y-3">
            {reviews.map((r) => <ReviewItem key={r.id} r={r} onReply={reply} />)}
          </ul>
        </SectionCard>
      </div>
    
  );
}

function ReviewItem({ r, onReply }: { r: ReturnType<typeof useSupplierReviews>["reviews"][number]; onReply: (id: string, text: string) => void }) {
  const [text, setText] = useState(r.reply ?? "");
  const [editing, setEditing] = useState(!r.reply);
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{r.customer}</div>
          <div className="text-xs text-muted-foreground">on {r.productName} • {new Date(r.createdAt).toLocaleDateString()}</div>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm">{r.comment}</p>
      <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3">
        {editing ? (
          <>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a public reply…" rows={2} />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setText(r.reply ?? ""); }}>Cancel</Button>
              <Button size="sm" onClick={() => { onReply(r.id, text); toast.success("Reply saved"); setEditing(false); }}>Post reply</Button>
            </div>
          </>
        ) : (
          <div>
            <div className="text-xs font-semibold text-brand">Your reply</div>
            <p className="mt-1 text-sm">{r.reply}</p>
            <Button size="sm" variant="ghost" className="mt-1 h-7 px-2 text-xs" onClick={() => setEditing(true)}>Edit</Button>
          </div>
        )}
      </div>
    </li>
  );
}
