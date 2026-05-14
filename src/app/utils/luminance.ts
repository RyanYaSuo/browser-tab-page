export type Theme = "light" | "dark";

/** Load an image URL into a canvas and detect whether it's light or dark. */
export function detectLuminance(
  url: string,
  signal?: AbortSignal,
): Promise<Theme> {
  return new Promise((resolve) => {
    if (signal?.aborted) { resolve("dark"); return; }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";

    const onAbort = () => { img.src = ""; resolve("dark"); };
    signal?.addEventListener("abort", onAbort, { once: true });

    img.onload = () => {
      if (signal?.aborted) { resolve("dark"); return; }
      try {
        const canvas = document.createElement("canvas");
        const size = 64; // small sample for performance
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Perceived luminance (ITU-R BT.601)
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        resolve(total / (data.length / 4) > 128 ? "light" : "dark");
      } catch {
        resolve("dark");
      }
    };

    img.onerror = () => resolve("dark");
    img.src = url;
  });
}
