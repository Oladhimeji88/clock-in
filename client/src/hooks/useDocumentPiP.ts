import { useCallback, useEffect, useRef, useState } from 'react';

// Document Picture-in-Picture isn't in the standard lib.dom.d.ts yet.
interface DocumentPictureInPicture {
  requestWindow: (options?: {width?: number;height?: number;}) => Promise<Window>;
  window: Window | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

/** Copies the app's stylesheets into a freshly opened PiP document so
 * portaled content renders with the same styling as the main page. */
function copyStylesInto(target: Document) {
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    target.head.appendChild(node.cloneNode(true));
  });
}

export function useDocumentPiP() {
  const supported = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const openingRef = useRef(false);

  const open = useCallback(
    async (width = 280, height = 220) => {
      if (!supported || !window.documentPictureInPicture || openingRef.current) return;
      openingRef.current = true;
      try {
        const win = await window.documentPictureInPicture.requestWindow({ width, height });
        copyStylesInto(win.document);
        win.document.documentElement.dataset.theme = document.documentElement.dataset.theme ?? '';
        win.document.body.style.margin = '0';
        win.document.body.style.background = '#0a0e17';
        win.document.body.style.overflow = 'hidden';
        win.addEventListener(
          'pagehide',
          () => {
            setPipWindow(null);
          },
          { once: true }
        );
        setPipWindow(win);
      } catch {
        // user dismissed the permission prompt, or the call was rejected — no-op
      } finally {
        openingRef.current = false;
      }
    },
    [supported]
  );

  const close = useCallback(() => {
    pipWindow?.close();
    setPipWindow(null);
  }, [pipWindow]);

  // If the user closes the PiP window via its own chrome, clean up state.
  useEffect(() => {
    if (!pipWindow) return;
    const handlePageHide = () => setPipWindow(null);
    pipWindow.addEventListener('pagehide', handlePageHide);
    return () => pipWindow.removeEventListener('pagehide', handlePageHide);
  }, [pipWindow]);

  return { supported, pipWindow, open, close };
}
