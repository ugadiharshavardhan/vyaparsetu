import { useCallback, useRef, useState } from "react";
import { CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function UploadDropzone({
  label, hint, value, onChange, accept = "image/*,application/pdf",
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const upload = useCallback(async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("business-documents").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = await supabase.storage.from("business-documents").createSignedUrl(path, 60 * 60 * 24 * 365);
      onChange(data?.signedUrl ?? path);
      toast.success(`${label} uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [label, onChange, user]);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) void upload(f);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition",
          drag ? "border-brand bg-brand-soft/30" : "border-border bg-muted/30 hover:border-brand/50 hover:bg-brand-soft/20",
          value && "border-success/40 bg-success-soft/40",
        )}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
            <p className="mt-2 text-xs text-muted-foreground">Uploading…</p>
          </>
        ) : value ? (
          <>
            <CheckCircle2 className="h-6 w-6 text-success" />
            <p className="mt-2 text-sm font-medium text-success">Uploaded</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" /> Remove & re-upload
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
