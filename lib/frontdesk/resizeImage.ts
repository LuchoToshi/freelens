/**
 * Shrink a photo before it is uploaded.
 *
 * A profile photo is rendered at 96px and a cover at a few hundred, so a 5MB
 * phone photo is thousands of times larger than anything the page will use.
 * Resizing in the browser is what lets the field accept the file people
 * actually have without pushing that weight through the upload, the storage
 * bill, and every future page load.
 *
 * Browser only, and deliberately forgiving: if anything in the pipeline is
 * unavailable or fails, the original file is returned and the upload proceeds
 * as it did before. A photo that uploads unoptimised is a far better outcome
 * than one that does not upload at all.
 */
export interface ResizeResult {
  file: File;
  /** True when the returned file is the original, untouched. */
  original: boolean;
}

export async function resizeImage(
  file: File,
  { maxEdge = 1024, quality = 0.85, skipUnder = 512 * 1024 } = {},
): Promise<ResizeResult> {
  if (file.size <= skipUnder) return { file, original: true };
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return { file, original: true };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return { file, original: true };
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    // Only keep the result if it actually saved something: a small, already
    // optimised image can come back larger than it went in.
    if (!blob || blob.size >= file.size) return { file, original: true };

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return { file: new File([blob], name, { type: "image/webp" }), original: false };
  } catch {
    return { file, original: true };
  }
}
