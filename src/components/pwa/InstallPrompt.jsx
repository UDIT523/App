import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";

const DISMISS_KEY = "sparepro:install-dismissed";

// Already running as an installed app? Then there's nothing to prompt.
function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// Only nudge phones/tablets to install — desktop/laptop (Windows/Mac) users
// keep the browser's own unobtrusive address-bar install icon, no banner.
function isMobileDevice() {
  const ua = window.navigator.userAgent;
  // iPadOS 13+ Safari reports a desktop Mac UA, so detect it via touch points.
  const isIpadOs =
    /macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
  return /android|iphone|ipad|ipod|mobile|silk|kindle/i.test(ua) || isIpadOs;
}

// iOS Safari never fires `beforeinstallprompt`; install is manual via the
// Share menu — and only works in Safari (not Chrome/Edge/Firefox on iOS).
function isIosSafari() {
  const ua = window.navigator.userAgent;
  // iPadOS 13+ Safari reports a desktop Mac UA, so detect it via touch points.
  const isIpadOs =
    /macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
  const isIos = /iphone|ipad|ipod/i.test(ua) || isIpadOs;
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  return isIos && isSafari;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1"
  );

  useEffect(() => {
    if (dismissed || isStandalone() || !isMobileDevice()) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // No install event on iOS — surface manual instructions instead.
    if (isIosSafari()) setShowIosHint(true);

    const onInstalled = () => {
      setDeferredPrompt(null);
      setShowIosHint(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [dismissed]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (dismissed) return null;
  const visible = deferredPrompt || showIosHint;
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[90] flex justify-center p-4 sm:justify-end sm:p-6",
        "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-4",
          "shadow-[var(--shadow-soft)]"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">Install SparePro</p>
            {deferredPrompt ? (
              <p className="mt-0.5 text-sm text-ink-500">
                Add it to your device to use it like an app.
              </p>
            ) : (
              <p className="mt-0.5 inline-flex flex-wrap items-center gap-1 text-sm text-ink-500">
                In Safari, tap
                <Share className="inline h-4 w-4 text-ink-700" />
                Share, then “Add to Home Screen”.
              </p>
            )}
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {deferredPrompt && (
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={install}>
              <Download className="h-4 w-4" />
              Install app
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
