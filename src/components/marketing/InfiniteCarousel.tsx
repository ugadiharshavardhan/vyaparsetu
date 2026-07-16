import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Seconds for one full loop of the duplicated track */
  durationSec?: number;
  className?: string;
  trackClassName?: string;
  /** Pause when hovering the whole marquee viewport */
  pauseOnHover?: boolean;
  /** Pause when hovering any descendant matching this selector (e.g. flip cards) */
  pauseOnChildHoverSelector?: string;
  /** Scroll left→right instead of the default right-to-left drift. */
  reverse?: boolean;
};

/**
 * Seamless horizontal infinite marquee. Duplicates children and scrolls
 * continuously via CSS transform (no stepped index jumps).
 */
export function InfiniteCarousel({
  children,
  durationSec = 28,
  className,
  trackClassName,
  pauseOnHover = true,
  pauseOnChildHoverSelector,
  reverse = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);

  const duplicated = items.map((child, i) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ className?: string }>;
    return cloneElement(el, {
      key: `dup-${String(el.key ?? i)}`,
    });
  });

  const setPaused = (paused: boolean) => {
    if (!trackRef.current) return;
    trackRef.current.style.animationPlayState = paused ? "paused" : "running";
  };

  useEffect(() => {
    if (!pauseOnChildHoverSelector || !rootRef.current) return;
    const root = rootRef.current;

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(pauseOnChildHoverSelector)) setPaused(true);
    };
    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null;
      // Still inside another pauseable card — keep paused
      if (related instanceof Element && related.closest(pauseOnChildHoverSelector)) return;
      setPaused(false);
    };

    root.addEventListener("mouseover", onOver);
    root.addEventListener("mouseout", onOut);
    return () => {
      root.removeEventListener("mouseover", onOver);
      root.removeEventListener("mouseout", onOut);
    };
  }, [pauseOnChildHoverSelector]);

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => {
        if (!pauseOnHover) return;
        setPaused(true);
      }}
      onMouseLeave={() => {
        if (!pauseOnHover) return;
        setPaused(false);
      }}
    >
      <div
        ref={trackRef}
        className={cn("flex w-max will-change-transform", trackClassName)}
        style={
          {
            animation: `${reverse ? "vs-marquee-reverse" : "vs-marquee"} ${durationSec}s linear infinite`,
          } as CSSProperties
        }
      >
        {items}
        {duplicated}
      </div>

      <style>{`
        @keyframes vs-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes vs-marquee-reverse {
          from { transform: translate3d(-50%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
      `}</style>
    </div>
  );
}
