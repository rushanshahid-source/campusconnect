import type { SyntheticEvent } from "react";

// Local, self-contained placeholder used when a remote image is missing/broken.
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

/**
 * onError handler for <img>: swaps a broken/missing image for the local
 * placeholder. Guards against an infinite loop if the placeholder itself fails.
 */
export function onImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallback === "1") return;
  img.dataset.fallback = "1";
  img.src = PLACEHOLDER_IMAGE;
}
