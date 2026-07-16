import { useEffect, useRef, useState } from "react";
import { CheckCircle2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type LocalAsset = {
  file: File;
  previewUrl: string;
};

/** Pre-auth dropzone — stores a local File until the account session exists. */
export function LocalAssetDropzone({
  label,
  value,
  onChange,
  accept = "image/png,image/jpeg,image/jpg,image/webp,application/pdf",
}: {
  label: string;
  value: LocalAsset | null;
  onChange: (asset: LocalAsset | null) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    return () => {
      if (value?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(value.previewUrl);
      }
    };
  }, [value?.previewUrl]);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    if (value?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(value.previewUrl);
    }
    onChange({ file, previewUrl: URL.createObjectURL(file) });
  };

  return (
    <div>
      <div className="mb-1.5">
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition",
          drag ? "border-brand bg-brand-soft/30" : "border-border bg-muted/30 hover:border-brand/50 hover:bg-brand-soft/20",
          value && "border-success/40 bg-success-soft/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => pick(e.target.files)}
        />
        {value ? (
          <>
            {value.file.type.startsWith("image/") ? (
              <img
                src={value.previewUrl}
                alt={label}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-success" />
            )}
            <p className="mt-2 text-sm font-medium text-success">{value.file.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (value.previewUrl.startsWith("blob:")) URL.revokeObjectURL(value.previewUrl);
                onChange(null);
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" /> Remove &amp; re-upload
            </button>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-brand" />
            <p className="mt-2 text-sm font-medium">Drop file or click to upload</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">PNG, JPG or PDF · up to 5 MB</p>
          </>
        )}
      </div>
    </div>
  );
}
