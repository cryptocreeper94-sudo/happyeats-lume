import { toPng, toBlob } from "html-to-image";
import { jsPDF } from "jspdf";

export const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const FULL_PAGE_WIDTH = 816;
const FULL_PAGE_HEIGHT = 1056;

let captureLock = false;

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob"));
    }, "image/png");
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
};

const fetchAsDataUrl = async (url: string): Promise<string> => {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const resolveImageUrl = async (src: string): Promise<string> => {
  if (!src || src.startsWith("data:")) return src;
  if (src.startsWith("http") && !src.includes(window.location.host)) {
    return fetchAsDataUrl(`/api/proxy-image?url=${encodeURIComponent(src)}`);
  }
  if (src.startsWith("/") || src.startsWith("http")) {
    return fetchAsDataUrl(src);
  }
  return src;
};

const inlineImagesOnElement = async (element: HTMLElement): Promise<() => void> => {
  const originals: Array<{ el: HTMLImageElement; src: string }> = [];
  const bgOriginals: Array<{ el: HTMLElement; bg: string }> = [];

  const imgs = element.querySelectorAll("img");
  for (const img of Array.from(imgs)) {
    const src = img.getAttribute("src") || "";
    if (src.startsWith("data:")) continue;
    originals.push({ el: img, src });
    try {
      const dataUrl = await resolveImageUrl(src);
      img.setAttribute("src", dataUrl);
    } catch (e) {
      console.warn("Failed to inline image:", src, e);
    }
  }

  const allEls = element.querySelectorAll("*");
  for (const el of Array.from(allEls)) {
    const htmlEl = el as HTMLElement;
    const inlineBg = htmlEl.style.backgroundImage || "";
    let bgImg = inlineBg;
    if (!bgImg || bgImg === "none") {
      try {
        bgImg = window.getComputedStyle(htmlEl).backgroundImage || "";
      } catch (_) { /* ignore */ }
    }
    const match = bgImg.match(/url\(["']?(https?:\/\/[^"')]+|\/[^"')]+)["']?\)/);
    if (match && match[1] && !match[1].startsWith("data:")) {
      bgOriginals.push({ el: htmlEl, bg: inlineBg });
      try {
        const dataUrl = await resolveImageUrl(match[1]);
        htmlEl.style.backgroundImage = `url("${dataUrl}")`;
      } catch (e) {
        console.warn("Failed to inline bg:", match[1], e);
      }
    }
  }

  return () => {
    originals.forEach(({ el, src }) => el.setAttribute("src", src));
    bgOriginals.forEach(({ el, bg }) => { el.style.backgroundImage = bg; });
  };
};

const filter = (node: HTMLElement) => {
  if (node.tagName === "NOSCRIPT" || node.tagName === "SCRIPT") return false;
  return true;
};

const acquireLock = async (): Promise<boolean> => {
  if (captureLock) return false;
  captureLock = true;
  return true;
};

const releaseLock = () => { captureLock = false; };

const captureElement = async (
  element: HTMLElement,
  bgColor: string,
  scale: number = 3
): Promise<string> => {
  if (!(await acquireLock())) {
    throw new Error("Another export is already in progress. Please wait.");
  }

  const mobile = isMobile();
  const pixelRatio = mobile ? Math.min(scale, 2) : Math.min(scale, 3);

  const restore = await inlineImagesOnElement(element);

  const origWidth = element.style.width;
  const origMinWidth = element.style.minWidth;
  const origMaxWidth = element.style.maxWidth;
  element.style.width = `${FULL_PAGE_WIDTH}px`;
  element.style.minWidth = `${FULL_PAGE_WIDTH}px`;
  element.style.maxWidth = `${FULL_PAGE_WIDTH}px`;

  try {
    await new Promise((r) => setTimeout(r, 200));

    const opts = {
      width: FULL_PAGE_WIDTH,
      height: element.scrollHeight || FULL_PAGE_HEIGHT,
      pixelRatio,
      backgroundColor: bgColor,
      cacheBust: true,
      skipFonts: true,
      includeQueryParams: true,
      filter,
      fetchRequestInit: { mode: "cors" as RequestMode, cache: "force-cache" as RequestCache },
    };

    let dataUrl = "";
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        dataUrl = await toPng(element, opts);
        if (dataUrl && dataUrl !== "data:," && dataUrl.length > 200) {
          return dataUrl;
        }
      } catch (e) {
        lastError = e as Error;
        console.warn(`toPng attempt ${attempt + 1} failed:`, e);
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    if (lastError) throw lastError;
    throw new Error("All capture attempts produced empty results");
  } finally {
    element.style.width = origWidth;
    element.style.minWidth = origMinWidth;
    element.style.maxWidth = origMaxWidth;
    restore();
    releaseLock();
  }
};

const captureToBlob = async (
  element: HTMLElement,
  bgColor: string,
  scale: number = 3
): Promise<Blob> => {
  if (!(await acquireLock())) {
    throw new Error("Another export is already in progress. Please wait.");
  }

  const mobile = isMobile();
  const pixelRatio = mobile ? Math.min(scale, 2) : Math.min(scale, 3);

  const restore = await inlineImagesOnElement(element);

  const origWidth = element.style.width;
  const origMinWidth = element.style.minWidth;
  const origMaxWidth = element.style.maxWidth;
  element.style.width = `${FULL_PAGE_WIDTH}px`;
  element.style.minWidth = `${FULL_PAGE_WIDTH}px`;
  element.style.maxWidth = `${FULL_PAGE_WIDTH}px`;

  try {
    await new Promise((r) => setTimeout(r, 200));

    const opts = {
      width: FULL_PAGE_WIDTH,
      height: element.scrollHeight || FULL_PAGE_HEIGHT,
      pixelRatio,
      backgroundColor: bgColor,
      cacheBust: true,
      skipFonts: true,
      includeQueryParams: true,
      filter,
      fetchRequestInit: { mode: "cors" as RequestMode, cache: "force-cache" as RequestCache },
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const blob = await toBlob(element, opts);
        if (blob && blob.size > 100) return blob;
      } catch (e) {
        lastError = e as Error;
        console.warn(`toBlob attempt ${attempt + 1} failed:`, e);
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    if (lastError) throw lastError;
    throw new Error("All capture attempts produced empty results");
  } finally {
    element.style.width = origWidth;
    element.style.minWidth = origMinWidth;
    element.style.maxWidth = origMaxWidth;
    restore();
    releaseLock();
  }
};

export const universalDownload = async (blob: Blob, filename: string) => {
  try {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
    return;
  } catch (e) {
    console.error("Blob URL download failed:", e);
  }

  try {
    const base64 = await blobToBase64(blob);
    const w = window.open("", "_blank");
    if (w) {
      w.document.title = filename;
      if (blob.type === "application/pdf") {
        w.document.write(`<iframe src="${base64}" style="width:100%;height:100%;border:none;position:fixed;top:0;left:0;"></iframe>`);
      } else {
        w.document.write(`<!DOCTYPE html><html><head><title>${filename}</title></head><body style="margin:0;background:#000;display:flex;justify-content:center"><img src="${base64}" style="max-width:100%;height:auto" /></body></html>`);
      }
      w.document.close();
    }
  } catch (e2) {
    console.error("All download methods failed:", e2);
    alert("Download failed. Please try the Print button and choose 'Save as PDF'.");
  }
};

export const universalShare = async (blob: Blob, filename: string, title?: string) => {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type });
    const shareData = { files: [file], title: title || filename };
    try {
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return true;
    }
  }
  await universalDownload(blob, filename);
  return false;
};

export const universalEmail = async (blob: Blob, filename: string, subject?: string) => {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type });
    const shareData = { files: [file], title: subject || filename };
    try {
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
  }
  await universalDownload(blob, filename);
  const mailSubject = encodeURIComponent(subject || "Happy Eats Marketing Material");
  const mailBody = encodeURIComponent(
    `Here is the ${filename} from Happy Eats.\n\nThe file has been downloaded to your device. Please attach it to this email.`
  );
  setTimeout(() => {
    window.open(`mailto:?subject=${mailSubject}&body=${mailBody}`, "_blank");
  }, 1500);
};

export const captureElementAsImage = async (
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string | null }
): Promise<void> => {
  const bgColor = options?.backgroundColor || "#1e293b";
  try {
    const blob = await captureToBlob(element, bgColor, options?.scale ?? 3);
    await universalDownload(blob, filename);
  } catch (e) {
    console.error("Image capture failed:", e);
    alert(`Image download failed: ${(e as Error)?.message || "Unknown error"}. Please try the Print button instead.`);
  }
};

export const captureElementAsPDF = async (
  element: HTMLElement,
  filename: string,
  options?: {
    scale?: number;
    backgroundColor?: string | null;
    orientation?: "portrait" | "landscape";
    format?: string | [number, number];
  }
): Promise<void> => {
  const bgColor = options?.backgroundColor || "#1e293b";
  try {
    const orientation = options?.orientation ?? "portrait";
    const dataUrl = await captureElement(element, bgColor, options?.scale ?? 3);

    const pdf = new jsPDF({
      orientation,
      unit: "in",
      format: options?.format ?? "letter",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const tempImg = new Image();
    await new Promise<void>((res, rej) => {
      tempImg.onload = () => res();
      tempImg.onerror = () => rej(new Error("Failed to load captured image"));
      tempImg.src = dataUrl;
    });

    const imgRatio = tempImg.width / tempImg.height;
    let finalW = pdfWidth;
    let finalH = pdfWidth / imgRatio;
    if (finalH > pdfHeight) {
      finalH = pdfHeight;
      finalW = pdfHeight * imgRatio;
    }
    const x = (pdfWidth - finalW) / 2;
    const y = (pdfHeight - finalH) / 2;
    pdf.addImage(dataUrl, "PNG", x, y, finalW, finalH);

    const pdfBlob = pdf.output("blob");

    if (isMobile() && navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], filename, { type: "application/pdf" });
      const shareData = { files: [file], title: filename };
      try {
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }

    await universalDownload(pdfBlob, filename);
  } catch (e) {
    console.error("PDF generation failed:", e);
    alert(`PDF download failed: ${(e as Error)?.message || "Unknown error"}. Please try the PNG button instead.`);
  }
};

export const captureElementAndShare = async (
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string | null }
): Promise<void> => {
  const bgColor = options?.backgroundColor || "#1e293b";
  try {
    const blob = await captureToBlob(element, bgColor, options?.scale ?? 3);
    await universalShare(blob, filename);
  } catch (e) {
    console.error("Share capture failed:", e);
    alert(`Share failed: ${(e as Error)?.message || "Unknown error"}.`);
  }
};

export const captureElementAndEmail = async (
  element: HTMLElement,
  filename: string,
  subject?: string,
  options?: { scale?: number; backgroundColor?: string | null }
): Promise<void> => {
  const bgColor = options?.backgroundColor || "#1e293b";
  try {
    const blob = await captureToBlob(element, bgColor, options?.scale ?? 3);
    await universalEmail(blob, filename, subject);
  } catch (e) {
    console.error("Email capture failed:", e);
    alert(`Email failed: ${(e as Error)?.message || "Unknown error"}.`);
  }
};

export const captureElementAndPrint = async (
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string | null }
): Promise<void> => {
  const bgColor = options?.backgroundColor || "#1e293b";
  try {
    const dataUrl = await captureElement(element, bgColor, options?.scale ?? 2);

    const w = window.open("", "_blank");
    if (!w) {
      alert("Please allow popups to print. Then try again.");
      return;
    }
    w.document.write(`<!DOCTYPE html><html><head><title>Print Flyer</title>
<style>
  @page { size: letter portrait; margin: 0.25in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: #fff; }
  body { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .no-print { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 20px; font-family: sans-serif; max-width: 600px; }
  .no-print h3 { color: #0369a1; margin-bottom: 8px; font-size: 16px; }
  .no-print p { color: #475569; font-size: 14px; line-height: 1.5; }
  img { width: 100%; max-width: 8in; height: auto; display: block; }
  @media print {
    .no-print { display: none !important; }
    body { justify-content: flex-start; }
    img { width: 100%; max-width: none; max-height: 10.5in; object-fit: contain; }
  }
</style>
</head><body>
  <div class="no-print">
    <h3>Ready to Print</h3>
    <p>The print dialog should open automatically. If not, press Ctrl+P (or Cmd+P on Mac).<br/>
    Set margins to "None" or "Minimum" for best results.<br/>
    Choose "Save as PDF" to save a file you can email or take to a print shop.</p>
  </div>
  <img id="printImg" src="${dataUrl}" />
</body></html>`);
    w.document.close();

    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      setTimeout(() => { try { w.print(); } catch (_e) { /* user can print manually */ } }, 300);
    };
    const img = w.document.getElementById("printImg") as HTMLImageElement;
    if (img && img.complete) {
      doPrint();
    } else if (img) {
      img.onload = doPrint;
    }
    setTimeout(doPrint, 2000);
  } catch (e) {
    console.error("Print capture failed:", e);
    alert(`Print failed: ${(e as Error)?.message || "Unknown error"}. Please try downloading the PDF instead.`);
  }
};

export const downloadFileAsset = async (src: string, filename: string) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    await universalDownload(blob, filename);
  } catch (e) {
    console.error("Download failed:", e);
    window.open(src, "_blank");
  }
};

export const shareFileAsset = async (src: string, filename: string) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    await universalShare(blob, filename);
  } catch (e) {
    console.error("Share failed:", e);
    window.open(src, "_blank");
  }
};

export const emailFileAsset = async (src: string, filename: string, subject?: string) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    await universalEmail(blob, filename, subject);
  } catch (e) {
    console.error("Email failed:", e);
    window.open(src, "_blank");
  }
};
