import { useCallback, useRef, useState } from "react";
import { ImagePlus, Star, Trash2, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { moveImageToFront } from "@/lib/productImages";
import { supabase } from "@/integrations/supabase/client";

const PRODUCT_IMAGE_BUCKET = "product-images";

export function ImageManager({
  images,
  onChange,
}: {
  images: string[];
  /** @deprecated First image is always primary; kept for call-site compat. */
  thumbnailIndex?: number;
  onChange: (next: { images: string[]; thumbnailIndex: number }) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [draggingOver, setDraggingOver] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = useCallback(
    (nextImages: string[]) => {
      onChange({ images: nextImages, thumbnailIndex: 0 });
    },
    [onChange],
  );

  // Upload files to Supabase Storage and store public URLs — NEVER embed base64
  // data URIs in the DB (that bloats products.images and times out marketplace queries).
  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !files.length) return;
      setUploading(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) {
          toast.error("Your session expired. Please sign in again to upload images.");
          return;
        }

        const uploaded: string[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) {
            toast.error(`"${file.name}" is not an image.`);
            continue;
          }
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const objectPath = `${userId}/product-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}.${ext}`;
          const { error } = await supabase.storage
            .from(PRODUCT_IMAGE_BUCKET)
            .upload(objectPath, file, { contentType: file.type || undefined, upsert: true });
          if (error) {
            toast.error(`Couldn't upload "${file.name}": ${error.message}`);
            continue;
          }
          const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(objectPath);
          if (data?.publicUrl) uploaded.push(data.publicUrl);
        }

        if (uploaded.length) emit([...images, ...uploaded]);
      } finally {
        setUploading(false);
      }
    },
    [images, emit],
  );

  const remove = (idx: number) => {
    emit(images.filter((_, i) => i !== idx));
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    emit(next);
  };

  const makePrimary = (idx: number) => {
    emit(moveImageToFront(images, idx));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={`${src.slice(0, 48)}-${i}`}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingOver(i);
            }}
            onDragLeave={() => setDraggingOver((cur) => (cur === i ? null : cur))}
            onDrop={() => {
              if (dragIndex.current !== null) reorder(dragIndex.current, i);
              dragIndex.current = null;
              setDraggingOver(null);
            }}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted",
              i === 0 && "ring-2 ring-brand/40",
              draggingOver === i && "ring-2 ring-brand",
            )}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
              {i === 0 ? "1 · Banner" : i + 1}
            </div>
            <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 via-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => makePrimary(i)}
                disabled={i === 0}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full bg-white/95 text-foreground shadow",
                  i === 0 && "bg-brand text-white",
                )}
                title={i === 0 ? "Banner image" : "Make banner (move to first)"}
              >
                <Star className="h-3.5 w-3.5" />
              </button>
              <GripVertical className="h-4 w-4 text-white/80" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-destructive shadow"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void addFiles(e.dataTransfer.files);
          }}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/30 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              Add / drop
            </>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-muted-foreground">
        Drag to reorder. Image <span className="font-semibold text-foreground">#1</span> is the
        product banner on marketplace, landing, and product pages. Star moves an image to first.
      </p>
    </div>
  );
}
