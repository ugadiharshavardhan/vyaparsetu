import { useCallback, useRef, useState } from "react";
import { ImagePlus, Star, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { moveImageToFront } from "@/lib/productImages";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = useCallback(
    (nextImages: string[]) => {
      onChange({ images: nextImages, thumbnailIndex: 0 });
    },
    [onChange],
  );

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const readers = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }),
      );
      Promise.all(readers).then((urls) => {
        emit([...images, ...urls]);
      });
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
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/30 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
        >
          <ImagePlus className="h-5 w-5" />
          Add / drop
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        Drag to reorder. Image <span className="font-semibold text-foreground">#1</span> is the
        product banner on marketplace, landing, and product pages. Star moves an image to first.
      </p>
    </div>
  );
}
