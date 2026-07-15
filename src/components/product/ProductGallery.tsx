import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Viewport */}
      <div className="relative group/gallery">
        <div
          ref={imgRef}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMove}
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card shadow-soft cursor-zoom-in transition-all duration-300 hover:shadow-elevated"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              src={images[active]}
              alt={alt}
              className="h-full w-full object-cover select-none pointer-events-none"
              style={{
                transform: zoom ? "scale(2.0)" : "scale(1)",
                transformOrigin: `${pos.x}% ${pos.y}%`,
              }}
            />
          </AnimatePresence>

          {/* Carousel Control Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-foreground shadow-soft backdrop-blur opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-white hover:text-brand cursor-pointer z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-foreground shadow-soft backdrop-blur opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-white hover:text-brand cursor-pointer z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Zoom Overlay Indicator */}
          <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-brand shadow-soft backdrop-blur transition-transform duration-300 hover:scale-105">
            <ZoomIn className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
          {images.map((g, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                active === i
                  ? "border-brand ring-4 ring-brand/10 scale-95"
                  : "border-border hover:border-brand/40 hover:scale-95"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={g} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-black/95 text-white flex flex-col justify-center items-center rounded-2xl shadow-elevated">
          <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
            <img
              src={images[active]}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
            />

            {/* Lightbox Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails at the bottom of Lightbox */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 border-t border-white/10 w-full justify-center bg-black/50">
              {images.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-12 w-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    active === i ? "border-brand scale-110" : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
