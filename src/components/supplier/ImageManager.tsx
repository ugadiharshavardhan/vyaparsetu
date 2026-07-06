import { useCallback, useRef, useState } from "react";
import { ImagePlus, Star, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageManager({
  images,
  thumbnailIndex,
  onChange,
}: {
  images: string[];
  thumbnailIndex: number;
  onChange: (next: { images: string[]; thumbnailIndex: number }) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [draggingOver, setDraggingOver] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        onChange({ images: [...images, ...urls], thumbnailIndex });
      });
    },
    [images, thumbnailIndex, onChange],
  );

  const remove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    const nextThumb = idx === thumbnailIndex ? 0 : idx < thumbnailIndex ? thumbnailIndex - 1 : thumbnailIndex;
    onChange({ images: next, thumbnailIndex: Math.max(0, nextThumb) });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const thumbUrl = images[thumbnailIndex];
    onChange({ images: next, thumbnailIndex: Math.max(0, next.indexOf(thumbUrl)) });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
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
              draggingOver === i && "ring-2 ring-brand",
            )}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 via-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onChange({ images, thumbnailIndex: i })}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full bg-white/95 text-foreground shadow",
                  thumbnailIndex === i && "bg-brand text-white",
                )}
                title="Set as thumbnail"
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
            {thumbnailIndex === i && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                Thumbnail
              </span>
            )}
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
      <p className="text-xs text-muted-foreground">Drag to reorder. Click the star to set the thumbnail.</p>
    </div>
  );
}
