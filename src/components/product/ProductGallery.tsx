import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div>
      <div
        ref={imgRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}
        className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={images[active]}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-200 ease-out"
            style={{
              transform: zoom ? "scale(1.9)" : "scale(1)",
              transformOrigin: `${pos.x}% ${pos.y}%`,
            }}
          />
        </AnimatePresence>
        <div className="pointer-events-none absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand shadow-soft backdrop-blur">
          <ZoomIn className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {images.map((g, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
              active === i ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-brand/40"
            }`}
            aria-label={`View image ${i + 1}`}
          >
            <img src={g} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
